# M04 verification report: Shell contract mirror and runtime replay

- Date: 2026-08-28
- Shell branch: `codex/M04-runtime-contracts-host-skeleton`
- Shell base: `c83d1e4a` (approved M03 checkpoint)
- Runtime branch: `codex/M04-runtime-contracts-host-skeleton`
- Runtime base: `7f10841`
- Protocol: `1.0`
- Generated semantic contract SHA-256: `10d97640967b62ed78f88d264b4b41f2a9bbf093f36b19d58a3392b0c2457304`
- Status: **AUTOMATED PASS; HUMAN VISUAL/ARIA REVIEW PENDING**

## Delivered shell slice

- `libs/agent-runtime-client` with the Rust-generated protocol mirror and strict runtime replay validation.
- Normal and incompatible-major committed runtime traces.
- Translation from authoritative `RuntimeStateSnapshot`/`SurfacePlan` into the existing M03 `FixtureSnapshot`.
- Real completion-toast and fatal-error-stage replay through `FixturePreview` and `AgentSurfaceLayer`.
- Studio controls/query routes, unit tests, interaction tests, and two visual plus two ARIA review candidates.

The TypeScript package contains no Tauri or named-pipe API. Webviews remain browser fixtures and never connect directly
to the runtime pipe.

## Acceptance evidence

| Criterion                                 | Result                                                                 |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| Shell and host connect/reconnect          | PASS in the sibling runtime's real Windows named-pipe integration test |
| Protocol incompatibility visible and safe | Automated PASS; human visual/ARIA review pending                       |
| Replay drives real shell surfaces         | Automated PASS; human visual/ARIA review pending                       |
| No Codex dependency                       | PASS in both repositories                                              |

The shell candidate passes generated-contract drift, TypeScript/unit validation, Studio build, runtime-replay
interactions, compare-only Playwright visual/ARIA tests, source-policy checks, Deno formatting/linting, and repository
diff checks. Final local results were 13 unit/policy tests and 97 Playwright tests: 75 visual/ARIA comparisons and 22
interactions. Deno checked 1,033 formatted files and 357 linted files; TypeScript/Svelte reported zero errors and zero
warnings. The first full run detected a legacy replay-control accessible-name regression; the M03 name was restored,
then the focused regression and complete suite passed.

## Review candidates

- `tools/shell-studio/tests/visual/runtime-replay.visual.spec.ts-snapshots/m04-thinking-to-result-chromium-win32.png`
- `tools/shell-studio/tests/visual/runtime-replay.visual.spec.ts-snapshots/m04-protocol-incompatible-chromium-win32.png`
- `tools/shell-studio/tests/aria/runtime-replay.aria.spec.ts-snapshots/m04-thinking-to-result.aria.yml`
- `tools/shell-studio/tests/aria/runtime-replay.aria.spec.ts-snapshots/m04-protocol-incompatible.aria.yml`

Agent visual inspection found both candidates contained, aligned, readable, consistent with the approved Vantablack
surface system, and free of clipping/bleed. The ARIA trees expose meaningful named status/region structure. Human review
is still mandatory under the repository snapshot policy.

## Safety

No production Seelen/Tauri path, widget entrypoint, named-pipe bridge, global shortcut, hook, taskbar behavior, service,
AppBar, updater, installer, autostart, or developer-shell configuration was added or exercised.

M04 remains incomplete until the user approves the candidate visual and ARIA baselines. M05 has not begun.
