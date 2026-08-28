# ADR 0008: Layer Agent OS surfaces over the approved shell

- Status: accepted for M03 implementation
- Date: 2026-08-27

## Context

M02 established and received human approval for the Omarchy-compatible shell experience. The original handoff reserves
M03 for the Agent OS design tokens, accessibility primitives, six sanctioned surface containers, deterministic runtime
presentation, theme and motion fixtures, and active-monitor behavior.

The Agent layer must not replace or compete with the approved desktop. It also must not introduce a persistent
dashboard, sidebar, transcript, or reasoning view.

## Decision

Implement M03 inside the browser-only `@agent-os/shell-ui` package and Shell Studio before adding a native widget
entrypoint. The approved `ShellExperience` remains the underlay. A typed overlay slot lets deterministic Agent fixtures
render on the active monitor without importing a native bridge or changing production Seelen behavior.

Use a versioned semantic token contract derived from the active shell palette. The contract provides spacing, radii,
typography, keylines, restrained accent, elevation, focus, timing, and reduced-motion values. High contrast has explicit
non-color state affordances. Small transient surfaces may blur; stages remain mostly opaque and readable.

Map runtime presentation to exactly six native surface kinds:

1. Orb for persistent status and invocation, rendered as a small control inside the shell top bar;
2. Capsule for a transcript line, current step, and compact progress;
3. Sheet for blocking decisions, approvals, and short recovery choices;
4. Stage for artifacts and sustained review;
5. Sidecar for requested application context;
6. Toast for brief completion and undo.

Every plan includes the Orb. In the approved M03 interaction revision, the Orb is a restrained top-bar button rather
than a floating desktop element. The overlay is absent until the user clicks that button or uses the local Studio
hotkey. Idle invocation opens a compact composer Capsule; all other runtime detail remains mapped to the five contextual
containers. Completion may add a Toast, but dismissing that transient surface collapses the experience back to the
dormant top-bar Orb. Raw chain of thought is not represented in state or UI.

The browser fixture uses `Ctrl+Shift+Space` as a local, page-scoped invocation test. It does not register a Windows or
global shortcut; production shortcut ownership remains a later authorized milestone.

The fixture adapter owns a typed active-monitor identifier. Only that monitor receives the Agent control and invoked
overlay. Moving the fixture between monitors changes no Windows state and does not register a hook, shortcut, AppBar,
service, or native window.

## Consequences

- M03 remains safe in `just studio` and introduces no Tauri command, production shell entrypoint, runtime pipe, Windows
  API, hook, autostart, installer, updater, or service behavior.
- The approved shell-only route remains available for regression review.
- M03 visual and ARIA baselines are explicit review candidates; normal checks and CI remain compare-only.
- Native surface hosting and runtime transport remain later milestone work.
- Any future adaptive layout must produce one of the six sanctioned surface plans and obey the same active-monitor,
  focus, contrast, and reduced-motion contracts.
