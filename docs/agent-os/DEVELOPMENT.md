# Agent OS development and layout conventions

## Safe default

The default UI loop is `just studio`. It starts only the Svelte/Vite Shell Studio, uses fixture state from
`libs/agent-shell-ui`, and does not invoke Cargo, Tauri, PowerShell, or a native bridge. `just studio-test` runs the
unit, interaction, visual, and ARIA suites against pinned Playwright/Chromium inputs. Fixture clocks, identifiers,
random values, latency, and trace envelopes are deterministic.

M01 also provides one safe native command: `npm run harness`. It compiles the shell with `src/tauri.harness.conf.json`,
verifies the Harness identifier before constructing Tauri, and opens a normal fixture-only window. It does not register
production plugins, invoke handlers, pipes, services, hooks, shortcuts, AppBars, autostart, updater logic, or production
data paths.

Use `npm run harness:verify` after any bootstrap, adapter, Tauri configuration, or side-effect-boundary change. It opens
the Harness briefly and requires unchanged before/after fingerprints for the native taskbar, Seelen processes/services,
scheduled task, matching run keys and named pipes, and production roaming/local/temp trees.

Do not invoke `cargo run -- --agent-os-mode harness` directly: a production-context build fails closed by design. Do not
run `npm run dev`, generic `tauri dev`, Integration Mode, or Production Mode on a developer workstation.

Integration requires both the explicit CLI acknowledgement and `AGENT_OS_DISPOSABLE_ENVIRONMENT=1`, and remains
restricted to a disposable Windows environment. Studio fails closed in the native binary; Safe Mode remains reserved and
fails closed until M12.

## M03 commands

```powershell
just studio
just studio-test
just studio-update-snapshots # explicit candidate generation; requires human review
```

## M04 contract and replay commands

```powershell
npm run test:unit
npm run studio:build
npm run studio:test
```

The Rust generator lives in the sibling runtime repository. From that repository, the coordinated drift check is:

```powershell
cargo run --locked --quiet -p agent-contracts --bin generate-shell-types -- --check generated/shell-types/agent-contracts.ts ../agent-os-shell/libs/agent-runtime-client/src/generated/agent-contracts.ts
```

`libs/agent-runtime-client` is browser-safe. It consumes committed `.aostrace` JSONL and returns the same
`FixtureSnapshot` contract used by the approved surfaces. It does not connect to a named pipe or invoke Tauri. The
trusted native shell-backend bridge remains a later integration milestone.

Snapshot comparison runs on the pinned Windows CI image. No normal command updates baselines: the update flag exists
only behind `studio-update-snapshots`, which is absent from `check`, CI, and every other recipe.

The fixtures route keeps Agent UI dormant on load. Click the small Agent control in the active monitor's top bar or
press `Ctrl+Shift+Space` while Studio has focus to reveal the selected deterministic surface. This shortcut is local to
the browser page and is not a production/global keyboard registration. The shell-only route remains available from the
Preview selector for M02 regression comparison.

## M01 commands

```powershell
cargo check --locked --package seelen-ui --bin seelen-ui
cargo test --locked --package seelen-ui --bin seelen-ui agent_os
npm run harness:verify
```

## Branches

- `main` is releasable integration state.
- `upstream-master` is the fast-forward-only canonical Seelen mirror.
- `codex/Mxx-description` is a milestone/work-package branch created from `main`.
- No rebase, force-push, squash, or release-tag movement is part of the upstream workflow.
- Upstream changes enter `main` only by reviewed pull request after the required gates.

## Reserved shell layout

These paths establish ownership. M01 and M02 paths now contain their milestone implementations; later paths remain
reserved until their named milestone.

```text
docs/agent-os/                  architecture, security, development, decisions, reports
libs/agent-shell-ui/            shared Svelte 5 ports (M02) and Agent design system/surfaces (M03)
libs/agent-runtime-client/      generated/runtime client adapter (M04)
tools/shell-studio/             browser-only safe UI loop (M02)
src/background/modules/agent_os/ modern Seelen backend module (M07)
src/ui/svelte/agent_*/          thin native widget entrypoints (reserved for later authorized integration)
```

Do not create later-milestone source skeletons merely to fill this layout. A directory appears with the milestone that
owns its executable contract.
