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

## M02

| Area                  | Paths                                                                                                                           | Reason                                                                                | Production behavior changed? |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| Shared fixture UI     | `libs/agent-shell-ui/**`                                                                                                        | Add typed ports, deterministic fixtures, fake inputs, replay, and preview surrogate   | No                           |
| Browser-only Studio   | `tools/shell-studio/**`, `justfile`, `package.json`                                                                             | Add the safe HMR loop, controls, inspectors, and explicit snapshot workflow           | No                           |
| Snapshot verification | `.github/workflows/ci.yml`, `package-lock.json`, `.gitignore`                                                                   | Pin Playwright/Vite tooling and compare Windows visual/ARIA baselines without updates | No                           |
| Project records       | `AGENTS.md`, `docs/agent-os/**`, `UPSTREAM_PATCHES.md`                                                                          | Record the M02 boundary, decision, candidate evidence, and human review gate          | No                           |
| Omarchy reference     | `libs/agent-shell-ui/src/themes/**`, `libs/agent-shell-ui/src/assets/**`, `docs/agent-os/upstream/**`, `THIRD_PARTY_NOTICES.md` | Pin and normalize the approved source-grounded shell experience and provenance        | No                           |
| Shell experience lab  | `libs/agent-shell-ui/src/surfaces/ShellExperience.svelte`, `tools/shell-studio/**`                                              | Add the complete shell-first browser prototype and deterministic review states        | No                           |

M02 does not add a native widget entrypoint, Tauri command, production shell surface, runtime protocol, Windows hook,
service behavior, updater/installer path, or Agent OS production design system.

## M03

| Area                      | Paths                                                                                          | Reason                                                                                          | Production behavior changed? |
| ------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------- |
| Agent design system       | `libs/agent-shell-ui/src/design-system/**`, `components/**`, `accessibility/**`                | Add versioned semantic tokens, reusable controls, progress, hidden text, and focus containment  | No                           |
| Presentation and surfaces | `libs/agent-shell-ui/src/presentation/**`, `state/**`, `surfaces/**`, `ports/shell-adapter.ts` | Add deterministic six-surface plans, top-bar invocation, active-monitor placement, and collapse | No                           |
| Browser verification      | `tools/shell-studio/**`, `libs/agent-shell-ui/tests/**`                                        | Add 29 visual/ARIA fixtures and interaction, scaling, keyboard, and reduced-motion coverage     | No                           |
| Project records           | `docs/agent-os/**`, `UPSTREAM_PATCHES.md`                                                      | Record the M03 layering decision, browser-only boundary, evidence, and human review gate        | No                           |

M03 changes only the browser Studio and shared preview package. It does not add a native widget entrypoint, Tauri
command, runtime transport, global shortcut, Windows hook, service behavior, AppBar, updater/installer path, or
production shell change.

## M04

| Area                      | Paths                                          | Reason                                                                                | Production behavior changed? |
| ------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| Generated protocol mirror | `libs/agent-runtime-client/src/generated/**`   | Commit the deterministic TypeScript output of runtime `agent-contracts` protocol 1.0  | No                           |
| Runtime replay adapter    | `libs/agent-runtime-client/src/**`, `tests/**` | Validate runtime snapshots and translate them into the approved real surface contract | No                           |
| Browser replay evidence   | `tools/shell-studio/src/replay/**`, `tests/**` | Exercise normal and incompatible runtime traces with visual and ARIA candidates       | No                           |
| Project records           | `docs/agent-os/**`, `UPSTREAM_PATCHES.md`      | Record the M04 ownership, trust boundary, decision, evidence, and review gate         | No                           |

M04 changes only the browser Studio and generated/shared TypeScript package in the shell repository. The authenticated
named-pipe implementation is confined to the separate runtime repository. M04 adds no production Seelen command, widget
entrypoint, global shortcut, hook, taskbar behavior, service, AppBar, updater, installer, or autostart path.

## M05

| Area                          | Paths                                          | Reason                                                                                   | Production behavior changed? |
| ----------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------- |
| Generated protocol mirror     | `libs/agent-runtime-client/src/generated/**`   | Advance to protocol 1.1 with correlations, input controls, and exact approval state      | No                           |
| Codex replay adapter          | `libs/agent-runtime-client/src/**`, `tests/**` | Map text stream, completion artifact, approval, and restart state into approved surfaces | No                           |
| Browser presentation evidence | `tools/shell-studio/**`                        | Exercise Orb composer, capsule stream, approval sheet, result stage, and recovery replay | No                           |
| Project records               | `docs/agent-os/**`, `UPSTREAM_PATCHES.md`      | Record M05 ownership, security boundary, decisions, evidence, and waived separate review | No                           |

M05 changes only the browser Studio and generated/shared TypeScript package in the shell repository. The verified Codex
child process, JSONL transport, thread registry, and restart supervisor remain in the separate runtime repository. M05
adds no production Seelen command, widget entrypoint, global shortcut, hook, taskbar behavior, service, AppBar, updater,
installer, autostart path, or Windows mutation.
