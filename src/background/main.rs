// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![feature(never_type)]

mod agent_os;
mod app;
mod backups;
mod cli;
mod error;
mod exposed;
mod hook;
mod logger;
mod migrations;
mod modules;
mod resources;
mod server;
mod session;
mod state;
mod tauri_context;
mod tauri_plugins;
mod telemetry;
mod utils;
mod virtual_desktops;
mod widgets;
mod windows_api;

#[macro_use]
extern crate rust_i18n;
i18n!("background/i18n", fallback = "en");

use std::sync::{atomic::AtomicBool, OnceLock};

use agent_os::{RealShellAdapter, StartupArgs, StartupSelection};
use app::SeelenUI;
use clap::Parser;
use cli::{handle_console_client, SelfPipe, ServicePipe};
use error::Result;
use exposed::register_invoke_handler;
use logger::SeelenLogger;
use session::application::SessionManager;
use slu_ipc::messages::SvcAction;
use tauri::Manager;
use tauri_plugins::register_plugins;
use utils::{
    integrity::{is_already_running, print_initial_information, restart_as_appx, warn_if_elevated},
    is_running_as_appx, was_installed_using_msix,
};

use crate::{
    app::get_app_handle,
    error::ResultLogExt,
    utils::{constants::SEELEN_COMMON, CRONOMETER},
};

static APP_HANDLE: OnceLock<tauri::AppHandle<tauri::Wry>> = OnceLock::new();
static TOKIO_RUNTIME_HANDLE: OnceLock<tokio::runtime::Handle> = OnceLock::new();

static SILENT: AtomicBool = AtomicBool::new(false);
static VERBOSE: AtomicBool = AtomicBool::new(false);

pub fn is_local_dev() -> bool {
    cfg!(dev)
}

pub fn get_tokio_handle() -> &'static tokio::runtime::Handle {
    TOKIO_RUNTIME_HANDLE
        .get()
        .expect("Tokio runtime was not initialized")
}

#[tokio::main]
async fn main() -> std::process::ExitCode {
    let startup_args = match StartupArgs::try_parse() {
        Ok(arguments) => arguments,
        Err(error) => {
            let _ = error.print();
            return std::process::ExitCode::from(2);
        }
    };
    let startup = match startup_args.select_bootstrap() {
        Ok(startup) => startup,
        Err(error) => {
            eprintln!("Agent OS startup refused: {error}");
            return std::process::ExitCode::from(2);
        }
    };

    let effectful_bootstrap = match startup {
        StartupSelection::Harness(harness_bootstrap) => {
            return agent_os::run_harness(harness_bootstrap);
        }
        StartupSelection::Effectful(effectful_bootstrap) => effectful_bootstrap,
    };
    let shell_adapter = RealShellAdapter::new(effectful_bootstrap);

    if let Err(err) = SeelenLogger::init() {
        let fallback = std::env::temp_dir().join("seelen-ui-logger-error.log");
        let _ = std::fs::write(&fallback, format!("Failed to initialize logger: {err:?}"));
        return std::process::ExitCode::from(1);
    }

    if let Err(err) = handle_console_client(&startup_args).await {
        log::error!("Failed to execute command: {err:?}");
        return std::process::ExitCode::from(1);
    };

    if is_already_running() {
        SelfPipe::request_open_settings().await.log_error();
        return std::process::ExitCode::from(0);
    }

    if was_installed_using_msix() && !is_running_as_appx() {
        log::info!("GUI was installed using MSIX, restarting as appx...");
        restart_as_appx().log_error();
        return std::process::ExitCode::from(0);
    }

    TOKIO_RUNTIME_HANDLE
        .set(tokio::runtime::Handle::current())
        .expect("Failed to set runtime handle");

    rust_i18n::set_locale(&seelen_core::state::Settings::get_app_language());

    let _ = CRONOMETER;
    let mut app_builder = tauri::Builder::default().manage(shell_adapter);
    app_builder = register_plugins(app_builder);
    app_builder = register_invoke_handler(app_builder);

    // if no custom runtime is present, the app will use the installed with the system
    if let Some(path) = crate::utils::get_fixed_runtime_path() {
        std::env::set_var("WEBVIEW2_BROWSER_EXECUTABLE_FOLDER", path);
    }

    let app = app_builder
        .setup(|app| {
            APP_HANDLE.set(app.handle().to_owned()).unwrap();
            tokio::spawn(async move {
                let handle = get_app_handle();
                let adapter = handle.state::<RealShellAdapter>();
                if let Err(err) = setup(handle, &adapter).await {
                    log::error!("Error while setting up: {err:?}");
                    handle.exit(1);
                }
                CRONOMETER.record("Setup");
            });
            Ok(())
        })
        .build(tauri_context::get_context())
        .expect("Error while building tauri application");

    // share the current runtime with Tauri
    tauri::async_runtime::set(tokio::runtime::Handle::current());

    let exit_code = app.run_return(app_callback);
    std::process::ExitCode::from(exit_code as u8)
}

async fn setup(
    app_handle: &tauri::AppHandle<tauri::Wry>,
    shell_adapter: &RealShellAdapter,
) -> Result<()> {
    let capability = shell_adapter.capability();
    log::info!(
        "Agent OS runtime mode: {}; namespace: {}",
        capability.mode(),
        shell_adapter.namespace().application_identifier
    );
    print_initial_information();
    create_main_folders(capability)?;

    SelfPipe::start_listener(capability)?;
    if !ServicePipe::is_running() {
        ServicePipe::start_service(capability).await?;
    }
    CRONOMETER.record("IPC");

    // Pre-warm SessionManager early so its PasswordVault decryption (~1s) overlaps
    // with the integrity checks instead of running during the startup critical path.
    std::thread::spawn(|| {
        let _ = SessionManager::instance();
    });

    if let Err(err) = tokio::try_join!(
        utils::integrity::validate_webview_runtime(),
        utils::integrity::ensure_bundle_files_integrity(app_handle),
        utils::integrity::check_for_webview_optimal_state(),
    ) {
        match err {
            utils::integrity::IntegrityError::WebviewRuntimeNotInstalled => {
                utils::integrity::show_not_installed_dialog(app_handle)?;
            }
            utils::integrity::IntegrityError::WebviewRuntimeOutdated => {
                utils::integrity::show_outdated_dialog(app_handle)?;
            }
            utils::integrity::IntegrityError::BundleIntegrityFailed => {
                utils::integrity::show_bundle_integrity_dialog(app_handle);
            }
            utils::integrity::IntegrityError::WebviewOptimalStateFailed => {}
        }
        return Err(format!("Integrity check failed: {err:?}").into());
    }
    CRONOMETER.record("Integrity check");

    SeelenUI::start(capability).await?;
    CRONOMETER.record("Start");

    warn_if_elevated(app_handle);
    telemetry::start_telemetry();
    backups::infrastructure::start_backup_sync();
    tokio::spawn(server::http::start_server());
    Ok(())
}

fn create_main_folders(_capability: &agent_os::ShellEffectCapability) -> Result<()> {
    std::fs::create_dir_all(SEELEN_COMMON.app_temp_dir())?;
    std::fs::create_dir_all(SEELEN_COMMON.app_data_dir())?;
    std::fs::create_dir_all(SEELEN_COMMON.app_cache_dir())?;

    std::fs::create_dir_all(SEELEN_COMMON.user_themes_path())?;
    std::fs::create_dir_all(SEELEN_COMMON.user_icons_path())?;
    std::fs::create_dir_all(SEELEN_COMMON.user_wallpapers_path())?;
    std::fs::create_dir_all(SEELEN_COMMON.user_sounds_path())?;
    std::fs::create_dir_all(SEELEN_COMMON.user_plugins_path())?;
    std::fs::create_dir_all(SEELEN_COMMON.user_widgets_path())?;
    Ok(())
}

fn app_callback(_: &tauri::AppHandle<tauri::Wry>, event: tauri::RunEvent) {
    match event {
        tauri::RunEvent::Ready => {
            log::info!("Tauri Application is ready.");
        }
        tauri::RunEvent::Resumed => {
            log::info!("Tauri Event Loop was resumed.");
        }
        tauri::RunEvent::ExitRequested { api, code, .. } => match code {
            Some(code) => {
                // if exit code is 0 it means that the app was closed by the user
                if code == 0 {
                    ServicePipe::request(SvcAction::Stop).log_error();
                }
            }
            // prevent close background on webview windows closing
            None => api.prevent_exit(),
        },
        tauri::RunEvent::Exit => {
            log::info!("───────────────────── Exiting Seelen UI ─────────────────────");
        }
        _ => {}
    }
}
