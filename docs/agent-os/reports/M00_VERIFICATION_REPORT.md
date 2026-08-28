# M00 verification report

- Date: 2026-08-27 (America/New_York)
- Shell baseline: `b4708a1c1f2158d1ce05f6bfa27ddcbb31bcd695` (`2.8.3`)
- Codex source snapshot: `2d929eb7c39a612b84e0987f2af4a4c2282249e2`
- Host: Windows 11 x64
- Safety: compile, test, static inspection, Git, and GitHub operations only; no Seelen process was launched

## Toolchain used

| Tool           | Version                                                       |
| -------------- | ------------------------------------------------------------- |
| Node.js        | `v24.19.0` (portable npm package, matching upstream CI major) |
| npm            | `10.9.2`                                                      |
| Deno           | `2.9.5`                                                       |
| rustc          | `1.97.0-nightly (e96c36b6f 2026-05-21)`                       |
| Cargo          | `1.97.0-nightly (4d1f98451 2026-05-15)`                       |
| Rust toolchain | `nightly-2026-05-22-x86_64-pc-windows-msvc`                   |

## Baseline build and check ledger

| Command                                              | Result                                | Evidence/notes                                                                                                                                                                                                                                                           |
| ---------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm install`                                        | PASS                                  | Core bindings generated; 433 packages installed. npm reported 3 dependency vulnerabilities: 1 low, 2 high. npm 10 removed five Linux `libc` lock metadata fields; the lockfile was restored to the pinned baseline and left unchanged.                                   |
| `deno fmt --check`                                   | PASS                                  | 871 files checked.                                                                                                                                                                                                                                                       |
| `deno lint`                                          | PASS                                  | 324 files checked.                                                                                                                                                                                                                                                       |
| `npm run type-check`                                 | PASS                                  | TypeScript, Svelte, and Deno checks; Svelte reported 0 errors and 0 warnings.                                                                                                                                                                                            |
| `npm run test`                                       | PASS (empty gate)                     | Exits 0 because the baseline script is `"test": ""`; no JavaScript tests ran. This is a known baseline gap.                                                                                                                                                              |
| `npm run build:ui -- --production`                   | PASS with upstream npm-flag quirk     | npm consumed the reserved `--production` flag and the script reported development mode; all 27 UI entrypoints still built.                                                                                                                                               |
| `npx tsx scripts/build.ts --production`              | PASS                                  | Confirmed production mode; 2 React, 22 Svelte, and 3 vanilla entrypoints built.                                                                                                                                                                                          |
| `cargo build --locked`                               | PASS                                  | Unchanged workspace debug build completed in 3m56s. No binary was run.                                                                                                                                                                                                   |
| `cargo fmt -- --check`                               | PASS with Windows checkout workaround | The developer Git config materializes LF while rustfmt `newline_style=Native` expects CRLF on Windows. `cargo fmt` produced a temporary CRLF worktree with `git diff --exit-code` still clean; the check then passed. The final checkout was restored to clean LF bytes. |
| `cargo clippy --locked --all-targets -- -D warnings` | FAIL (known upstream)                 | `libs/slu-macros/src/lib.rs:94` triggers `clippy::excessive_nesting`. No production-code fix was made in M00.                                                                                                                                                            |
| `cargo test --locked --verbose`                      | PASS                                  | 33 unit tests passed (13 core, 14 shell, 6 utilities); all other harnesses and doc tests passed with zero failures.                                                                                                                                                      |
| `git diff --exit-code` at pinned baseline            | PASS                                  | Build/setup artifacts were ignored; tracked baseline bytes were restored before M00 edits.                                                                                                                                                                               |

The unchanged baseline builds successfully. The clippy defect, empty JavaScript gate, npm audit findings, npm production
flag behavior, and Windows newline behavior are recorded as known baseline findings rather than hidden or repaired by
out-of-scope production changes.

## Repository and workflow evidence

### Shell

- Fork: `https://github.com/StevenBuglione/Seelen-UI`
- `origin`: the fork
- `upstream`: `https://github.com/eythaann/Seelen-UI.git`
- `upstream-master`, `main`, and `codex/M00-baseline-fork-evidence` were created and pushed from the exact baseline.
- GitHub default branch is `main`.
- Weekly fast-forward upstream sync workflow is present and opens, but never merges, a review pull request.

### Runtime

- Private repository: `https://github.com/StevenBuglione/agent-os-runtime`
- `main` and `codex/M00-baseline-fork-evidence` were created and pushed.
- M00 establishes documents and reserved directory ownership only. The Rust workspace is correctly deferred to M04.

## Acceptance audit

| M00 criterion                                     | Status                     | Verification                                                                                |
| ------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| Fork Seelen                                       | PASS                       | Public fork exists and is the shell `origin`.                                               |
| Create runtime repository                         | PASS                       | Separate private GitHub/local repository exists.                                            |
| Record exact Seelen and Codex SHAs                | PASS                       | `UPSTREAM_BASELINE.md`; both commits verified through GitHub's commit API.                  |
| Build unchanged upstream baseline                 | PASS                       | Production UI and locked Rust debug builds passed at the pinned SHA.                        |
| Run current checks                                | PASS WITH RECORDED FAILURE | All current gates were run; exact clippy failure and non-gates are recorded above.          |
| Document current development startup side effects | PASS                       | Static reachability report completed without unsafe process execution.                      |
| Add architecture and upstream tracking docs       | PASS                       | Architecture, security, development, integration, patch ledger, ADRs, and inventory added.  |
| Create milestone branches                         | PASS                       | M00 branches pushed in both repositories.                                                   |
| No production Agent OS design changes             | PASS                       | No production shell/runtime code, Tauri config, generated bindings, service, or UI changed. |
| Baseline evidence and known failures recorded     | PASS                       | This report and the startup/repository inventories provide the evidence.                    |
| Upstream remote configured                        | PASS                       | Canonical Seelen fetch URL is configured; upstream push is disabled.                        |

M00 is complete when the documentation commits are pushed and both repository worktrees are clean. M01 and later work
remain intentionally unimplemented.
