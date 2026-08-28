# ADR 0005: Compile and authorize Harness separately

- Status: accepted
- Milestone: M01

## Decision

Parse `RuntimeMode` before all existing Seelen startup work. Preserve Production as the default, but construct a sealed
`ShellEffectCapability` only for Production or for Integration after two independent disposable-environment signals.
Build Harness through the Tauri `--config` overlay, verify the compiled Harness identifier before Tauri construction,
and inject only `FixtureShellAdapter`.

The Harness source is guarded by a policy test that rejects known production startup, IPC, service, hook, widget,
updater, and Win32 entry points. A native before/after audit is the executable acceptance gate.

## Consequences

- An environment variable cannot grant Harness shell effects.
- A Harness flag passed to a production-context binary fails closed.
- The normal Harness window has isolated WebView2/data/cache names and no production Tauri command surface.
- Integration still requires a disposable environment; the two software signals are not a substitute for that boundary.
- Safe Mode remains unavailable until its M12 diagnostics bootstrap is implemented.
