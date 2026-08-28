# M01 verification report

- Date: 2026-08-27 (America/New_York)
- Branch: `codex/M01-runtime-mode-side-effect-guard`
- Base: M00 shell commit `0a7b12667faed44eab142324d1e5b51979d82d2a`
- Host: Windows 11 x64
- Production startup executed: no

## Implemented contract

- `RuntimeMode` is parsed before logger initialization, CLI forwarding, existing-instance IPC, path resolution, plugins,
  or Tauri construction.
- Production remains the default, preserving the upstream launch contract.
- Studio and the not-yet-implemented Safe Mode fail closed in the native binary.
- Integration requires both `--acknowledge-agent-os-disposable-environment` and `AGENT_OS_DISPOSABLE_ENVIRONMENT=1`
  before the sealed capability can exist.
- `RealShellAdapter` can only be constructed from an effectful bootstrap; Harness receives `FixtureShellAdapter`.
- The Harness Tauri overlay has product/title `Agent OS Shell Harness`, identifier `com.agent-os.shell-harness`, a
  decorated resizable window, an isolated WebView2 directory, no updater/deep-link plugin configuration, and no
  production Tauri permissions or invoke handler.
- Production pipe names remain byte-for-byte compatible. Reserved Harness pipe names, data/cache names, and identifier
  are disjoint even though M01 Harness starts no IPC listener.
- A production-context binary refuses Harness before Tauri construction. The supported command is `npm run harness`.

## Automated verification ledger

| Gate                                                               | Result | Evidence                                                                                                                                         |
| ------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cargo check --locked --package seelen-ui --bin seelen-ui`         | PASS   | M01 shell compiles without warnings.                                                                                                             |
| `cargo test --locked --package seelen-ui --bin seelen-ui agent_os` | PASS   | 12 focused tests passed.                                                                                                                         |
| `cargo test --locked`                                              | PASS   | 45 workspace tests passed (13 core, 26 shell, 6 utils); all remaining targets and doc-tests passed with zero tests.                              |
| `cargo build --locked --package seelen-ui --bin seelen-ui`         | PASS   | The unchanged Production-default binary compiled; it was not launched.                                                                           |
| `cargo fmt --all -- --check`                                       | PASS   | Rust sources are formatted.                                                                                                                      |
| `deno fmt --check` / `deno lint`                                   | PASS   | 890 files passed formatting; 324 files passed lint.                                                                                              |
| `npm run type-check`                                               | PASS   | Svelte reported 0 errors and 0 warnings.                                                                                                         |
| Harness source policy                                              | PASS   | Known production service, hook, widget, IPC, updater, AppBar, autostart, and Win32 entry points are forbidden in `harness.rs`.                   |
| Capability tests                                                   | PASS   | Harness cannot construct the sealed capability; Production remains default; Integration requires both signals.                                   |
| Guard-failure tests                                                | PASS   | Each of 12 protected effect categories is denied and makes fixture quiescence fail.                                                              |
| Namespace/config tests                                             | PASS   | Production IPC compatibility retained; Harness identifier/data/cache/WebView2/pipe names are disjoint; inherited plugins/dev server are removed. |
| Production-context negative launch                                 | PASS   | Direct debug binary with Harness arguments exited 2 before Tauri construction.                                                                   |
| `npm run harness:verify`                                           | PASS   | Visible normal Harness window opened and exited automatically; protected host snapshot was identical before/after.                               |

The final native smoke reported:

```text
AGENT_OS_HARNESS_READY title="Agent OS Shell Harness" visible=true identifier=com.agent-os.shell-harness data=com.agent-os.shell-harness cache=com.agent-os.shell-harness webview_data=agent-os-shell-harness-webview2 app_pipe="\\\\.\\pipe\\agent-os-shell-harness-0" service_pipe="\\\\.\\pipe\\agent-os-shell-harness-service-0" guarded_effects=12 monitors=0 windows=0 workspaces=0 notifications=0
```

The protected snapshot retained a visible taskbar at `0,1392,2560,1440`, the pre-existing `Seelen UI Service` scheduled
task in `Ready` state, no matching process/service/run-key/named-pipe entries, and unchanged production roaming, local,
and temp tree fingerprints. The repeatable script also compares the complete scheduled-task XML.

The inherited repository-wide Clippy gate is not green at the pinned upstream baseline. The first all-target failure is
`clippy::excessive_nesting` in `libs/slu-macros/src/lib.rs:94`; a non-denying diagnostic audit of the M01-owned modules
reported zero warnings. The sole warning in the touched `background/main.rs` is the unchanged nested Tauri setup
callback already present at the M00 base. M01 does not suppress or broaden into that upstream cleanup.

## Acceptance audit

| M01 criterion                               | Status | Verification                                                                                                    |
| ------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| Harness opens as a normal window            | PASS   | Runtime reported the exact title and `visible=true`; config requires decorations and resizing.                  |
| Native taskbar remains unchanged            | PASS   | Handle, visibility, and rectangle were identical before/after.                                                  |
| No Seelen service start                     | PASS   | No process/service appeared; existing scheduled task definition/state was unchanged.                            |
| No hooks/shortcuts/AppBar/autostart/updater | PASS   | Harness call graph rejects those entry points, has no invoke/plugin surface, and host artifacts were unchanged. |
| No production pipe or data collision        | PASS   | No matching pipe appeared; production tree fingerprints were unchanged; namespace tests passed.                 |
| Test fails for every guarded effect         | PASS   | All 12 effect categories produce denial and a non-quiescent Harness gate.                                       |

M01 is reliable and complete. M02 may begin only after this report, the full repository gates, and the remote checkpoint
are verified.
