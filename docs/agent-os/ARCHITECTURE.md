# Agent OS architecture boundary

## Decision

Agent OS is a maintained Seelen UI fork plus a separate trusted Rust runtime. Windows applications remain native
applications. The shell presents deterministic surfaces and translates shell state; the runtime owns model lifecycle,
policy, automation, state, evidence, recovery coordination, and the narrow MCP relay.

```text
agent-os-shell (AGPL Seelen fork)
  shell surfaces + safe preview/harness + typed shell adapter
                  |
                  | authenticated, versioned, per-user named pipe
                  v
agent-os-runtime
  host + policy + desktop graph + action engine + journal + watchdog
                  |
                  | pinned JSONL/stdio contract (M05)
                  v
          Codex App Server
```

The repositories and primary processes are separate crash domains. Webviews never connect directly to the runtime pipe.
The model emits typed intents; deterministic native code validates policy, observes before/after state, executes, and
verifies postconditions.

## Safety order

M00 records the unchanged baseline. M01 establishes runtime-mode isolation, a sealed shell-effect capability, a
fixture-only adapter, and a separately compiled Tauri Harness overlay. Harness construction checks the compiled
application identifier before creating a window, so passing a Harness flag to a production-context binary fails closed.
M02 adds the shared Svelte package and a browser-only Shell Studio with deterministic fixture state, fake
time/IDs/random values/latency, `.aostrace` replay, inspectable `AgentRuntimeState`/`SurfacePlan`, and Windows
visual/ARIA comparison. Its preview renderer is deliberately a fixture surrogate; the production design system and
native surface entrypoints remain owned by M03. The user approved the corrected initial snapshot baselines on
2026-08-27, completing M02 and authorizing the serial transition to M03.

M03 adds the versioned Agent OS token contract, accessibility primitives, deterministic presentation mapping, and the
six sanctioned surface containers to the shared package. The approved Omarchy shell remains the visual underlay. Its
only persistent Agent affordance is a small top-bar Orb control; the contextual overlay is not mounted until explicit
local invocation. The Studio-only `Ctrl+Shift+Space` handler is page scoped and does not register a Windows shortcut.
All M03 work remains browser-only. The user approved its final visual and ARIA baseline candidate on 2026-08-28,
completing M03 and authorizing the serial transition to M04.

M04 establishes protocol 1.0 in the separate runtime repository and mirrors its deterministically generated TypeScript
contract into `libs/agent-runtime-client`. The browser-safe replay adapter performs runtime shape, safe-integer,
sequence, surface allowlist, and fail-closed compatibility validation before translating an authoritative runtime
snapshot into the existing `FixtureSnapshot` consumed by `FixturePreview` and `AgentSurfaceLayer`. The normal committed
trace ends on the real completion toast; the incompatible-major trace ends on the real sustained error stage and states
that Windows remains unchanged. No webview opens the named pipe and no native Seelen path is added in M04.

M05 advances the generated contract to protocol 1.1 and adds text-turn correlation, control state, and exact pending
approval data. Deterministic App Server traces drive the existing top-bar Orb composer, transient capsule, approval
sheet, and result stage. Private reasoning is absent from the shell contract and remains hidden unless a later explicit
review surface is invoked. The browser Studio still has no native pipe or Codex connection; the live stdio client and
thread lifecycle remain entirely in `agent-os-runtime`.

M01 changes bootstrap selection but preserves Production as the default and does not redesign any production shell
surface, protocol, runtime crate, Windows hook, or service behavior.

```text
Shell Studio (Vite, browser only)
          |
          v
@agent-os/shell-ui ports + deterministic fixtures
          |
          +-- FixtureShellAdapter (M02)
          +-- design system + six presentation surfaces (M03)
          +-- generated runtime contract + validated trace replay (M04)
          +-- Codex text/approval/restart presentation (M05)
          +-- native thin adapters (later milestone; not implemented)
```

## Repository ownership

- `agent-os-shell`: Seelen fork, shell surfaces, safe harness, shared shell UI, and Seelen integration.
- `agent-os-runtime`: contracts, App Server integration, voice control, policy, desktop graph, actions, journal,
  artifacts, automation, capture, watchdog, and any later narrowly scoped broker.

Process separation does not settle licensing obligations. Legal review is required before distribution.
