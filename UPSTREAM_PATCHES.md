# Agent OS upstream patch ledger

Every Agent OS change to a Seelen-owned subsystem must be listed here. Update this file in the same pull request as the
change.

## M00

| Area                | Paths                                                             | Reason                                                | Production behavior changed? |
| ------------------- | ----------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------- |
| Agent guidance      | `AGENTS.md`                                                       | Add the handoff and safe-development rules            | No                           |
| Upstream automation | `.github/workflows/upstream-sync.yml`                             | Create a weekly fast-forward mirror and review PR     | No                           |
| Project records     | `UPSTREAM_BASELINE.md`, `UPSTREAM_PATCHES.md`, `docs/agent-os/**` | Pin baselines, decisions, inventory, and M00 evidence | No                           |

No Rust, TypeScript, Svelte, Tauri configuration, widget metadata, service code, installer code, production resource, or
generated binding is modified by M00.

## M01

| Area                | Paths                                                                                         | Reason                                                                                            | Production behavior changed?                                             |
| ------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Bootstrap boundary  | `src/background/main.rs`, `src/background/agent_os/**`, selected `app.rs`/`cli/**` signatures | Parse mode first and require the sealed capability for production startup construction            | Production remains the default; existing effectful sequence is unchanged |
| Harness host        | `src/tauri.harness.conf.json`, `src/harness/**`, `package.json`                               | Provide a normal isolated window with fixture-only state and no production command/plugin surface | No                                                                       |
| Safety verification | `scripts/verify-harness-safety.ps1`, `.github/workflows/ci.yml`                               | Make the no-side-effect contract repeatable locally and visible in CI                             | No                                                                       |
| Project records     | `AGENTS.md`, `docs/agent-os/**`, `UPSTREAM_PATCHES.md`                                        | Record the M01 boundary, decision, and evidence                                                   | No                                                                       |

M01 does not change production widget metadata, service implementation, hook implementation, taskbar implementation,
installer, updater implementation, generated binding, or production UI design.
