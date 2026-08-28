# M05 verification report: Codex text surfaces

- Date: 2026-08-28
- Shell branch: `codex/M05-codex-app-server-text`
- Shell base: `66724085` (completed M04 checkpoint)
- Runtime branch: `codex/M05-codex-app-server-text`
- Runtime base: `ef2d5c8` (completed M04 checkpoint)
- Protocol: `1.1`
- Generated semantic contract SHA-256: `b1c55a571ff8e9a3d265a7d7ee580c3e429cfd659d86f03e49b29bb47729cf4b`
- Status: **COMPLETE; AUTOMATED AND LIVE TEXT EVIDENCE PASSED; OWNER WAIVED SEPARATE VISUAL/ARIA REVIEW**

## Delivered shell slice

- Protocol 1.1 generated mirror with thread/turn/item correlations, input/interrupt/recovery controls, and exact pending
  approval state.
- Strict replay mapping for text streams, Codex response artifacts, approvals, and reconnect/resume state.
- Working top-bar Orb composer callback, compact streaming capsule, exact approval sheet, and document-style result
  stage on the approved Omarchy-compatible shell underlay.
- Deterministic M05 text-turn, approval, and restart traces with queryable first/final frames and explicit event
  advance.
- Unit, interaction, visual, and ARIA coverage. The browser source remains free of Tauri and named-pipe access.

## Acceptance evidence

| Criterion                                                  | Result | Evidence                                                                                                                                                                                                                        |
| ---------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User enters text in the Orb composer                       | PASS   | Playwright fills and submits the real accessible composer, observes the capsule, and advances the deterministic correlated runtime stream. Empty text remains rejected by the component.                                        |
| Codex turn streams into capsule/stage without generic chat | PASS   | The committed trace is derived from the successful exact-marker live turn and renders only the contextual capsule followed by the result stage/document card. Existing policy coverage rejects a generic dashboard/chat screen. |
| Approval request renders in the sheet                      | PASS   | The real sheet exposes the exact action, target, command, rationale, medium risk, safe deny, once, and explicitly authorized workflow controls.                                                                                 |
| Restart resumes the thread                                 | PASS   | The recovery trace moves from reconnecting to restored while retaining `thread:m05:coordinator`; unit and interaction tests assert the correlation.                                                                             |
| Schema drift is CI-gated                                   | PASS   | The unit suite pins protocol 1.1 and the exact semantic contract hash; the sibling runtime CI regenerates and byte-checks the official pinned App Server schema and this mirror.                                                |

## Verification results

- `deno fmt --check`: 1,037 files checked after formatting the candidate.
- `deno lint`: 357 files checked.
- `npm run type-check`: TypeScript and Svelte reported zero errors and zero warnings.
- `npm run test:unit`: 15 tests passed.
- `npm run studio:build`: 201 modules transformed successfully.
- `npm run studio:test`: 104 compare-only Playwright tests passed: 79 visual/ARIA comparisons and 25 interactions.
- Coordinated Rust generation check: runtime and shell mirrors matched exactly.
- Repository diff hygiene: required before the immutable checkpoint.

## Visual and accessibility evidence

- `tools/shell-studio/tests/visual/runtime-replay.visual.spec.ts-snapshots/m05-text-turn-chromium-win32.png`
- `tools/shell-studio/tests/visual/runtime-replay.visual.spec.ts-snapshots/m05-approval-chromium-win32.png`
- `tools/shell-studio/tests/aria/runtime-replay.aria.spec.ts-snapshots/m05-text-turn.aria.yml`
- `tools/shell-studio/tests/aria/runtime-replay.aria.spec.ts-snapshots/m05-approval.aria.yml`

Agent inspection found the result stage centered, contained, readable, and expressed as a document artifact rather than
the earlier generic workspace placeholder. The approval sheet is centered and contained, with readable exact details and
no bleed. The ARIA trees expose named stage/dialog regions and all required controls. On 2026-08-28 the repository owner
explicitly waived separate human review; this report does not represent agent inspection as independent owner review.

## Safety

M05 changes only the browser Studio and generated/shared TypeScript package. It adds no production Seelen/Tauri path,
native widget entrypoint, global shortcut, hook, taskbar behavior, service, AppBar, updater, installer, autostart, or
developer-shell configuration. Studio remains a fixture process with no direct Codex, native pipe, command, or Windows
mutation access.
