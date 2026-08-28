# ADR 0009: Generate the runtime contract and validate replay before presentation

- Status: accepted
- Date: 2026-08-28

## Decision

Treat the runtime repository's Rust `agent-contracts` crate as the sole source of truth for protocol 1.0. Commit its
deterministic TypeScript output under `libs/agent-runtime-client`, validate every replay envelope and snapshot at the
adapter boundary, and translate accepted snapshots into the existing `FixtureSnapshot`/`SurfacePlan` consumed by the
real M03 surfaces.

## Consequences

Shell Studio demonstrates the M04 runtime contract without opening a native pipe from a webview. Malformed or
unsanctioned surfaces fail validation. A major protocol mismatch is rendered as the existing sustained error stage and
cannot be mistaken for an approval or action surface.
