# ADR 0006: Browser-only Shell Studio and deterministic fixture port

- Status: accepted for M02 candidate review
- Date: 2026-08-27

## Decision

Agent OS UI state is represented by types and a `ShellAdapter` port in `libs/agent-shell-ui`. M02 supplies only an
in-memory `FixtureShellAdapter`. Shell Studio is a standalone Svelte 5/Vite application that imports this same package,
binds to loopback, and has no Tauri/native bridge.

Time, identifiers, pseudo-random values, network latency, and trace replay are deterministic. Recorded replay uses the
redacted JSONL envelope from the handoff. All 26 M02 fixtures have a Windows visual snapshot and an ARIA snapshot.

Baseline mutation is available only through `just studio-update-snapshots`. Normal checks and CI compare snapshots and
cannot update them. Initial and changed baselines require human review before milestone acceptance.

## Consequences

- UI work and inspection do not compile Rust or change Windows shell state.
- Fixtures can be replayed through the same typed port that later thin native adapters will implement.
- M02 preview styling is test infrastructure, not the M03 production design system.
- Rendering baselines remain Windows-specific and must be reviewed rather than regenerated automatically.
