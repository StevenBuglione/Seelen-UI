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
