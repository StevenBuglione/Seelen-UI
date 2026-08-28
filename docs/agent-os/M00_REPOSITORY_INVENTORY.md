# M00 repository inventory against the implementation handoff

Baseline: Seelen UI `b4708a1c1f2158d1ce05f6bfa27ddcbb31bcd695` (`2.8.3`).

| Handoff concern                      | Baseline finding                                                                  | Evidence                                                            | Disposition                                            |
| ------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| Maintained shell fork                | No Agent OS fork existed before M00                                               | GitHub and local remote inventory                                   | Created in M00                                         |
| Separate runtime repository          | No runtime repository existed                                                     | GitHub and local directory inventory                                | Created in M00; source workspace deferred to M04       |
| Safe runtime modes                   | No `RuntimeMode` or capability guard                                              | No matching shell type/bootstrap; production setup is unconditional | M01                                                    |
| Native harness config                | Only production `src/tauri.conf.json` exists                                      | Production identifier, bundle, updater, and full startup            | M01                                                    |
| Browser-only Shell Studio            | No `tools/shell-studio`                                                           | Repository path inventory                                           | M02                                                    |
| Shared Agent OS UI package           | No `libs/agent-shell-ui`                                                          | Repository path inventory                                           | M02                                                    |
| Visual/ARIA suite                    | No Agent OS Playwright fixtures or snapshot gate                                  | Workflow and package inventory                                      | M02                                                    |
| Root JS tests                        | `package.json` contains `"test": ""`                                              | `npm run test` exits 0 with no output/tests                         | Known baseline gap; M02 adds real tests                |
| Current dev command safety           | `npm run dev` is `cargo build && tauri dev`                                       | `package.json`                                                      | Unsafe until M01; prohibited on developer host         |
| Typed Seelen commands/events         | Present and broad                                                                 | `libs/core/src/handlers/commands.rs`, `events.rs`                   | Reuse through adapters in later milestones             |
| Widget runtime                       | Webview deployment/reconcile exists                                               | `src/background/widgets/manager.rs`, `loader.rs`, `webview.rs`      | Useful shell foundation; not the policy boundary       |
| Widget permissions                   | Third-party permission boundary is narrow                                         | `src/background/widgets/permissions.rs`                             | Keep independent from Agent OS policy                  |
| Existing IPC                         | Per-session app/service pipes exist                                               | `libs/slu-ipc`                                                      | Starting point only; Agent OS protocol deferred to M04 |
| Service/hook/taskbar isolation       | Production setup starts service, hides taskbar conditionally, and registers hooks | Startup inventory                                                   | Must become unreachable in Harness Mode in M01         |
| App Server integration               | Absent                                                                            | No Codex client/runtime repo code                                   | M05                                                    |
| Voice                                | Absent                                                                            | No `VoiceBackend` or realtime spike                                 | M06                                                    |
| Desktop graph/actions/policy/journal | Absent as Agent OS contracts                                                      | No Agent OS runtime implementation                                  | M07-M11                                                |
| Watchdog/safe mode                   | Absent as Agent OS recovery boundary                                              | No Agent OS watchdog                                                | M12                                                    |

## Existing upstream structure retained

- Rust/Tauri shell backend under `src/background` and service under `src/service`.
- React, Svelte 5, and vanilla UI entrypoints under `src/ui`.
- Shared typed core and generated bindings under `libs/core`.
- Per-session named-pipe library under `libs/slu-ipc`.
- Existing Windows CI checks under `.github/workflows/ci.yml`.

M00 adds only evidence, governance, and sync automation. It does not pre-create later-milestone production modules.
