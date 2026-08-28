# Agent OS upstream baseline

Status: pinned for M00 on 2026-08-27.

## Seelen UI shell

| Field               | Value                                             |
| ------------------- | ------------------------------------------------- |
| Upstream            | `https://github.com/eythaann/Seelen-UI.git`       |
| Upstream branch     | `master`                                          |
| Pinned commit       | `b4708a1c1f2158d1ce05f6bfa27ddcbb31bcd695`        |
| Commit tree         | `807935ecb33233a571f462af3992fad0221bbc04`        |
| Package version     | `2.8.3`                                           |
| Commit time         | `2026-08-27T22:41:38Z`                            |
| License at baseline | `AGPL-3.0-or-later`                               |
| Agent OS fork       | `https://github.com/StevenBuglione/Seelen-UI.git` |

At M00 verification time, `upstream/master`, `origin/master`, `origin/upstream-master`, and the initial `origin/main`
all resolved to the pinned commit. The local `upstream` fetch URL is configured to the canonical Seelen repository; its
push URL is deliberately disabled so canonical upstream cannot be mutated from this checkout.

## Codex source contract snapshot

| Field                | Value                                      |
| -------------------- | ------------------------------------------ |
| Upstream             | `https://github.com/openai/codex.git`      |
| Pinned source commit | `2d929eb7c39a612b84e0987f2af4a4c2282249e2` |
| Commit tree          | `789d17cf49c0e6f480f9b0953eba06d9b3f8e07d` |
| Commit time          | `2026-08-27T23:36:08Z`                     |

This is a source/protocol research baseline only. M00 does not redistribute, download, start, or integrate a Codex
binary. The platform-specific binary version, artifact hashes, and generated schema hash are intentionally deferred to
M05, where the exact binary can be pinned and verified as one atomic contract.

## Branch contract

- `upstream-master`: fast-forward-only mirror of canonical `upstream/master`.
- `main`: releasable Agent OS shell integration branch.
- `codex/Mxx-description`: one review branch per milestone or work package.
- Initial M00 branch: `codex/M00-baseline-fork-evidence`.

See [`docs/agent-os/UPSTREAM_INTEGRATION.md`](docs/agent-os/UPSTREAM_INTEGRATION.md) for the sync procedure and
[`UPSTREAM_PATCHES.md`](UPSTREAM_PATCHES.md) for the complete local patch ledger.
