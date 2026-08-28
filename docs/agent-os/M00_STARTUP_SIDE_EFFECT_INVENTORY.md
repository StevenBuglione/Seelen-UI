# M00 current-development startup side-effect inventory

## Method and safety boundary

This is static code-path evidence at Seelen commit `b4708a1c1f2158d1ce05f6bfa27ddcbb31bcd695`. The production
development startup was deliberately not executed because it would violate the M00 host-safety constraint. Therefore
these effects are verified as reachable code paths, not claimed as live observations on this workstation.

`package.json:12` defines `npm run dev` as `cargo build && tauri dev`. Tauri then runs the real application entrypoint;
there is no development-only bootstrap that bypasses production setup.

## Startup-reachable effects

| Effect                                                 | Reachability and evidence                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production data/cache/resource directories             | `src/background/main.rs:130-138,177-188` creates production paths before service/integrity startup.                                                                                                                                                                                                     |
| Production self/service named pipes                    | `src/background/main.rs:134-138` starts the self listener and probes the service; `libs/slu-ipc/src/app.rs` and `service.rs` use `seelen-ui-*` production pipe names.                                                                                                                                   |
| Start Seelen service                                   | `src/background/main.rs:135-137` calls `ServicePipe::start_service` when the service pipe is unavailable. `src/background/cli/svc_pipe.rs:51-131` runs the scheduled task or the adjacent `slu-service.exe`.                                                                                            |
| Create/update scheduled task and logon trigger         | Service startup unconditionally calls `TaskSchedulerHelper::create_service_task` at `src/service/main.rs:152-155`; `src/service/task_scheduler.rs:50-101` creates/updates the highest-run-level service task and creates a logon trigger when no prior trigger is migrated.                             |
| Read user credentials/session state                    | `src/background/main.rs:140-144` prewarms `SessionManager`, whose startup accesses Windows PasswordVault/Credential Manager.                                                                                                                                                                            |
| Migrate and load production settings/resources         | `src/background/app.rs:56-83` runs migrations and initializes production resources/state. This can read and normalize persisted user configuration.                                                                                                                                                     |
| Hide native taskbar                                    | When the dock/WEG setting is enabled, `src/background/app.rs:85-92` sends `HideNativeTaskbar`; `src/background/widgets/weg/mod.rs:25-40` delegates to the service and `src/service/shutdown.rs` changes native taskbar visibility/state.                                                                |
| Reconcile real widget webviews                         | `src/background/app.rs:92-96` invokes `WIDGET_MANAGER.reconcile` and creates a real background event window. The widget manager/loader creates overlay, desktop, and popup webviews from production resources.                                                                                          |
| Register global Windows event hook and polling threads | `src/background/app.rs:98-99` calls `register_win_hook`; `src/background/hook.rs:79-115,155-190` installs `SetWinEventHook`, enumerates windows, and starts global cursor polling.                                                                                                                      |
| Register global shortcuts/keyboard capture             | `src/background/app.rs:107-115` sends resolved shortcuts to the service. `src/service/hotkeys.rs:11-71` starts keyboard capturing, clears existing Seelen registrations, and registers global hotkeys.                                                                                                  |
| Conditionally register AppBars                         | Dock and toolbar Svelte state call `RegisterAppBar` (`src/ui/svelte/weg/state/settings.svelte.ts:189` and `src/ui/svelte/fancy-toolbar/state/settings.svelte.ts:95`); the backend calls `SHAppBarMessage` through `src/background/widgets/mod.rs:342-368`. Reconciled real widgets can reach this path. |
| Hide shell notification surfaces                       | While WEG is enabled, `src/background/widgets/weg/hook.rs:18-42` hides matching ShellExperienceHost notification UI and re-hides recreated taskbars.                                                                                                                                                    |
| External/background integrations                       | `src/background/app.rs:101-105` starts Discord RPC and a production resource watcher; `src/background/main.rs:170-174` starts telemetry, backup sync, and the local HTTP server.                                                                                                                        |
| Updater capability                                     | `src/background/tauri_plugins.rs:3-11` installs the updater plugin into the real app. Update checks are exposed commands, not found as an unconditional call in the inspected startup sequence.                                                                                                         |

## Exposed but not proven unconditional at startup

- Autostart mutation is exposed by `src/background/app.rs:146-168` and settings UI calls, separate from the service's
  startup-time scheduled-task creation described above.
- Native wallpaper, focus assist, network, power, brightness, file, process, and updater actions are typed commands. No
  unconditional startup call to mutate those settings was found in the inspected path.
- AppBar registration depends on the reconciled widget and its reservation settings.

## M00 conclusion

The existing `dev` path is unsafe as an ordinary Agent OS loop. M01 must select the bootstrap before any production
setup and require an unforgeable shell-effect capability for every path above. Environment variables alone are
insufficient.
