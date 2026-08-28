# Agent OS development and layout conventions

## Safe default

Until M01 and M02 are complete, there is no safe native Agent OS development command. Do not run the current Seelen
development or production startup on a developer workstation. Build and static/test commands are allowed only when they
do not execute Seelen binaries.

After M02, `just studio` becomes the default UI loop and must not compile Rust. Harness, Integration, Production, and
Safe Mode commands are added only in their assigned milestones.

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
