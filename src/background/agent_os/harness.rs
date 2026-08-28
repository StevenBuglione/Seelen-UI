use std::process::ExitCode;

use tauri::{Manager, RunEvent};

use super::{
    namespace::RuntimeNamespace, runtime_mode::HarnessBootstrap, shell_adapter::FixtureShellAdapter,
};

const HARNESS_WINDOW_LABEL: &str = "agent-os-harness";

pub fn run_harness(bootstrap: HarnessBootstrap) -> ExitCode {
    let adapter = FixtureShellAdapter::new();
    if let Err(error) = adapter.verify_quiescent() {
        eprintln!("Agent OS Harness refused to start: {error}");
        return ExitCode::from(1);
    }

    let context = crate::tauri_context::get_context();
    if context.config().identifier != RuntimeNamespace::HARNESS.application_identifier {
        eprintln!("Agent OS Harness refused a non-harness Tauri context. Use `npm run harness`.");
        return ExitCode::from(2);
    }

    let app = match tauri::Builder::default()
        .manage(adapter)
        .setup(|app| {
            let config = app
                .config()
                .app
                .windows
                .iter()
                .find(|window| window.label == HARNESS_WINDOW_LABEL)
                .ok_or("Agent OS Harness window configuration is missing")?;
            tauri::WebviewWindowBuilder::from_config(app.handle(), config)?.build()?;
            Ok(())
        })
        .build(context)
    {
        Ok(app) => app,
        Err(error) => {
            eprintln!("Failed to build Agent OS Shell Harness: {error}");
            return ExitCode::from(1);
        }
    };

    let mut ready_seen = false;
    let exit_code = app.run_return(move |handle, event| {
        if !matches!(event, RunEvent::Ready) || ready_seen {
            return;
        }
        ready_seen = true;
        if let Err(error) = handle_ready(handle, bootstrap) {
            eprintln!("Agent OS Harness readiness failed: {error}");
            handle.exit(1);
        }
    });

    ExitCode::from(exit_code as u8)
}

fn handle_ready(
    handle: &tauri::AppHandle,
    bootstrap: HarnessBootstrap,
) -> Result<(), Box<dyn std::error::Error>> {
    let window = handle
        .get_webview_window(HARNESS_WINDOW_LABEL)
        .ok_or("Agent OS Harness window was not created")?;
    let adapter = handle.state::<FixtureShellAdapter>();
    adapter.verify_quiescent()?;

    let title = window
        .title()
        .unwrap_or_else(|_| "<unavailable>".to_owned());
    let visible = window.is_visible().unwrap_or(false);
    println!(
        "AGENT_OS_HARNESS_READY title={title:?} visible={visible} identifier={} data={} cache={} webview_data={} app_pipe={:?} service_pipe={:?} guarded_effects={} monitors={} windows={} workspaces={} notifications={}",
        adapter.namespace().application_identifier,
        adapter.namespace().data_directory_name,
        adapter.namespace().cache_directory_name,
        adapter.namespace().webview_data_directory_name,
        adapter.namespace().app_pipe_path(0),
        adapter.namespace().service_pipe_path(0),
        adapter.guarded_effect_count(),
        adapter.state().monitors.len(),
        adapter.state().windows.len(),
        adapter.state().workspaces.len(),
        adapter.state().notifications.len(),
    );

    if let Some(timeout_ms) = bootstrap.smoke_timeout_ms() {
        schedule_smoke_exit(handle.clone(), timeout_ms);
    }
    Ok(())
}

fn schedule_smoke_exit(handle: tauri::AppHandle, timeout_ms: u64) {
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(timeout_ms));
        handle.exit(0);
    });
}
