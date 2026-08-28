# M02 verification report

- Date: 2026-08-27 (America/New_York)
- Branch: `codex/M02-shared-ui-shell-studio`
- Base: verified M01 shell commit `7cedb8be398aec8a179e17c9df12001aa1b74821`
- Host: Windows 11 x64
- Production/native shell startup executed: no
- Status: revised shell-first candidate complete; human snapshot review pending

## Implemented contract

- `libs/agent-shell-ui` owns typed fixture state, `SurfacePlan`, `ShellAdapter`, deterministic inputs, `.aostrace`
  parsing, and the fixture preview surrogate.
- `tools/shell-studio` is a standalone Svelte 5/Vite application with HMR, 4 viewport presets, 4 DPI presets, light,
  dark, high-contrast, reduced-motion, and one/two-monitor controls.
- Studio exposes the current fixture state and surface plan and can inject speech, transcript, plan, command, image,
  MCP-tool, approval, error, cancellation, reconnection, and multi-agent events.
- The built-in replay processes ordered redacted JSONL envelopes with sequence, monotonic time, source, type,
  correlation, and payload fields.
- All 26 required fixtures have candidate Windows PNG and ARIA YAML baselines.
- Shell Studio now defaults to a separate shell-first experience with no visible Agent OS surface. It implements the
  pinned Omarchy Vantablack desktop, top bar, five workspaces, dwindle/master/columns/monocle layouts, launcher,
  calendar, quick settings, notifications, workspace overview, reduced motion, and one/two-monitor canvases.
- All 22 Omarchy theme palettes are normalized from the pinned main repository revision. Omarchy executable QML, Lua,
  shell scripts, Linux services, hooks, installers, autostart, and IPC are excluded.
- Six shell states have Windows PNG and ARIA YAML baselines in addition to the preserved 26 deferred Agent fixture
  pairs. The source pin, file hashes, compatibility map, asset provenance, and third-party notices are committed.
- Snapshot mutation is reachable only through `just studio-update-snapshots`; `check`, CI, and all comparison commands
  omit the update flag.
- Windows CI installs Node 24, Deno, and pinned Playwright Chromium, then builds Studio and compares all suites without
  setting up or compiling Rust.

## Automated verification ledger

| Gate                               | Result     | Evidence                                                                                                                                           |
| ---------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test`                     | PASS       | 8 unit/policy tests cover fixtures, determinism, replay, browser-only source, commands, baselines, 22 palettes, and shell evidence.                |
| `npm run type-check`               | PASS       | TypeScript and Svelte report 0 errors and 0 warnings; generated core types also pass Deno check.                                                   |
| `npm run studio:build`             | PASS       | Vite production build completes without Cargo/Tauri.                                                                                               |
| `npm run studio:test:interactions` | PASS       | 8 suites cover 26 fixtures plus shell panels, launcher flow, themes, workspaces, layouts, keyboard focus, and fake time.                           |
| Explicit snapshot generation       | PASS       | 33 Windows PNG and 32 ARIA YAML candidates generated only by the dedicated update command, including a zero-diff top-bar regression baseline.      |
| `npm run studio:test`              | PASS       | 8 unit tests and 73 Playwright comparisons/interactions passed after candidate generation.                                                         |
| In-app browser inspection          | PASS       | Desktop, launcher, quick settings, overview, light palette, accessibility tree, and interactions inspected; browser console has 0 warnings/errors. |
| Product Design source comparison   | PASS       | Omarchy source and browser implementation compared in normalized full and focused images; four-pass report ends `passed` in `design-qa.md`.        |
| `just` recipe dry runs             | PASS       | Studio recipes resolve only to npm/Vite/Playwright and contain no Cargo/Tauri invocation.                                                          |
| Windows snapshot CI                | CONFIGURED | Windows 2025, Node 24, and compare-only Studio tests; hosted execution awaits a pull request.                                                      |

The final dependency audit reports 3 inherited transitive findings (1 low, 2 high) in `body-parser`, `adm-zip`, and
`deepl-node`. The direct Vite advisories encountered during implementation were eliminated by pinning Vite 8.2.2 and
`@sveltejs/vite-plugin-svelte` 7.3.0. Playwright is pinned at 1.62.1 with Chromium revision 1234.

The workstation uses non-LTS Node 23.8.0, outside the Svelte plugin's declared engine set. All local gates pass, but npm
prints an engine warning. The supported and CI baseline is Node 24; no developer shell or system Node installation was
changed by M02.

## Acceptance audit

| M02 criterion                                                     | Status  | Verification                                                                                    |
| ----------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| UI change/open/inspect/screenshot/compare without Rust or Windows | PASS    | Browser-only commands, source policy, build, Playwright, and direct browser inspection passed.  |
| All required base fixtures render                                 | PASS    | All 26 names render through the shared package and have matching visual/ARIA candidates.        |
| Snapshot updates are explicit                                     | PASS    | A single dedicated update command exists; policy tests prove CI/normal commands cannot call it. |
| Initial baselines reviewed by a human                             | PENDING | The handoff requires human review; candidate files are ready under `tools/shell-studio/tests`.  |

## Revised visual-direction audit

The user rejected the initial generic Agent fixture styling and selected the complete main-repository Omarchy shell
experience as the prerequisite visual foundation. ADR 0007 records that Agent UI is deferred until this shell baseline
is approved. The default Studio route contains no orb, capsule, sheet, stage, sidecar, assistant drawer, or reasoning
surface.

The revised browser-only candidate was compared against Omarchy's Vantablack preview and dwindle-layout reference. The
first comparison found a global-grid collision and excess bar/density drift; both were fixed. Human feedback then found
that the reviewed bar was still too tall and its control treatment could cross the keyline. The third comparison
verifies the corrected 20-pixel bar, contained 18-pixel controls, and inset focus treatment. A fourth pass corrected
inherited Studio minimum-height styling that displaced the bar icons and verifies their centered alignment. No P0, P1,
or P2 finding remains. Two P3 follow-ups remain documented for future disposable-environment fidelity work.

M03 must not begin until the human reviewer accepts or requests changes to the 33 visual and 32 ARIA candidates.
