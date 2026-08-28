# M03 verification report

- Date: 2026-08-28 (America/New_York)
- Branch: `codex/M03-agent-os-design-system`
- Base: completed M02 checkpoint `749ec043c5c5e36c71a845fd65b36b39c498420f`
- Host: Windows 11 x64
- Production/native shell startup executed: no
- Status: complete; human snapshot review approved

## Implemented contract

- `@agent-os/shell-ui` is versioned `0.3.0` and exports the Agent OS token version, reusable controls, six surface
  containers, typed runtime presentation, and active-monitor contracts.
- The semantic token layer covers spacing, radii, type roles, surface elevation, keylines, focus, restrained accent,
  timing, explicit light/dark/high-contrast modes, and reduced motion.
- Runtime presentation maps rest, transient activity, decisions, artifacts, requested context, and completion to Orb,
  Capsule, Sheet, Stage, Sidecar, and Toast only. No dashboard, permanent sidebar, transcript view, or reasoning surface
  exists.
- The user-directed resting design places the small Orb invocation control inside the approved shell top bar. No Agent
  overlay is mounted until the user clicks it or uses the page-scoped Studio hotkey. Idle invocation opens the compact
  composer Capsule; voice remains off until deliberately initialized in a later milestone.
- Sheets trap focus and select the safe denial action by default. Stage, Sheet, Sidecar, Toast, and Capsule dismissal
  return the shell to the dormant top-bar control.
- The active monitor owns both the invocation control and any invoked surface. Moving the fixture changes no Windows
  state.
- All implementation and verification in M03 remain inside the browser-only Studio and shared TypeScript/Svelte package.
  No native widget, bridge, Tauri command, runtime pipe, global shortcut, hook, service, AppBar, autostart, updater,
  installer, or production shell process was added or run.

## Candidate evidence

- 29 deterministic M03 fixture names have Windows PNG and ARIA YAML baselines.
- Idle and hover candidates show only the small top-bar Agent control. Other fixtures explicitly invoke their mapped
  contextual surface before capture.
- Representative dark, Catppuccin Latte light, and high-contrast candidates were inspected directly in the in-app
  browser. Approval scrims cover the full active monitor; stages are mostly opaque; the sidecar remains contextual; the
  compact Capsule is anchored below the top bar.
- The compare-only suite covers 6 preserved shell states plus a focused top-bar regression snapshot.
- Candidate snapshots were generated only through `just studio-update-snapshots`; normal checks and CI remain
  compare-only.

## Automated verification ledger

| Gate                               | Result | Evidence                                                                                                                                                                                                                                                   |
| ---------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:unit`                | PASS   | 8 tests cover deterministic plans/fixtures, replay, browser-only source policy, explicit snapshot policy, 29 Agent baseline pairs, 22 Omarchy palettes, and shell evidence.                                                                                |
| `npm run type-check`               | PASS   | TypeScript and Svelte report 0 errors and 0 warnings; generated core types pass Deno check.                                                                                                                                                                |
| `npm run studio:build`             | PASS   | Vite production build completes without Cargo or Tauri.                                                                                                                                                                                                    |
| `npm run studio:test:interactions` | PASS   | 19 suites cover dormant/invoked behavior, local hotkey, all six surface mappings, keyboard focus/trap/restoration, active monitor, completion collapse, light/dark/contrast/reduced motion, shell regressions, and every contextual surface at 200% scale. |
| Explicit snapshot generation       | PASS   | 29 Agent PNG plus 29 Agent ARIA candidates and the preserved shell baselines were generated only through the dedicated update recipe.                                                                                                                      |
| `npm run studio:test`              | PASS   | 8 unit tests and 90 compare-only Playwright tests pass against the candidate bytes.                                                                                                                                                                        |
| In-app browser inspection          | PASS   | Dormant, invoked Capsule, Approval Sheet, Stage, Sidecar, light, dark, and high-contrast states were inspected directly; the live console contains 0 warnings or errors.                                                                                   |
| Source and diff policy             | PASS   | `git diff --check` is clean; shared UI/Studio source policy rejects native bridge entry points; the M03 shortcut is page scoped.                                                                                                                           |
| Human review                       | PASS   | The user approved the final M03 browser candidate on 2026-08-28 after the top-bar invocation and premium surface revision.                                                                                                                                 |

## Acceptance audit

| M03 criterion                                                 | Status | Verification                                                                                                                                                                                     |
| ------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| All surfaces meet visual, keyboard, scaling, and motion tests | PASS   | Visual/ARIA baselines plus 19 interaction suites cover all six kinds, keyboard-only invocation/focus restoration, 200% bounds, and opacity-only reduced motion; the user approved the candidate. |
| Default resting state is only the small Orb                   | PASS   | Idle mounts no Agent overlay; the small Orb is integrated into the active monitor's top bar.                                                                                                     |
| No dashboard/sidebar is introduced                            | PASS   | Typed mapping permits only the six sanctioned kinds; source and browser checks find no dashboard, permanent sidebar, or reasoning surface.                                                       |
| UI collapses cleanly after completion                         | PASS   | Dismissing completion removes the overlay and restores the dormant top-bar Orb; interaction coverage verifies the state transition.                                                              |

## Human review outcome

The user approved the final browser candidate on 2026-08-28. The approved baseline includes the dormant top-bar Agent
control, click and page-scoped hotkey invocation, contextual Capsule, Approval Sheet, Result Stage, Toast, and Sidecar,
plus light, dark, high-contrast, and reduced-motion states. All M03 acceptance criteria are satisfied, authorizing the
serial transition to M04.
