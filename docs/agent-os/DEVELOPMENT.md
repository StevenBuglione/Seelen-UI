# Agent OS development and layout conventions

## Safe default

M01 provides one safe native command: `npm run harness`. It compiles the shell with `src/tauri.harness.conf.json`,
verifies the Harness identifier before constructing Tauri, and opens a normal fixture-only window. It does not register
production plugins, invoke handlers, pipes, services, hooks, shortcuts, AppBars, autostart, updater logic, or production
data paths.

Use `npm run harness:verify` after any bootstrap, adapter, Tauri configuration, or side-effect-boundary change. It opens
the Harness briefly and requires unchanged before/after fingerprints for the native taskbar, Seelen processes/services,
scheduled task, matching run keys and named pipes, and production roaming/local/temp trees.

Do not invoke `cargo run -- --agent-os-mode harness` directly: a production-context build fails closed by design. Do not
run `npm run dev`, generic `tauri dev`, Integration Mode, or Production Mode on a developer workstation.

After M02, `just studio` becomes the default UI loop and must not compile Rust. Integration requires both the explicit
CLI acknowledgement and `AGENT_OS_DISPOSABLE_ENVIRONMENT=1`, and remains restricted to a disposable Windows environment.
Studio fails closed in the native binary; Safe Mode remains reserved and fails closed until M12.

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

These paths establish ownership; their implementations are deferred to the milestones named in the handoff.

```text
docs/agent-os/                  architecture, security, development, decisions, reports
libs/agent-shell-ui/            shared Svelte 5 surfaces and ports (M02)
libs/agent-runtime-client/      generated/runtime client adapter (M04)
tools/shell-studio/             browser-only safe UI loop (M02)
src/background/modules/agent_os/ modern Seelen backend module (M07)
src/ui/svelte/agent_*/          thin widget/harness entrypoints (M03+)
```

Do not create later-milestone source skeletons merely to fill this layout. A directory appears with the milestone that
owns its executable contract.
