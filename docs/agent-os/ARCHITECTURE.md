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
native surface entrypoints remain owned by M03. M02 acceptance is not complete until a human approves its initial
snapshot baselines.

M01 changes bootstrap selection but preserves Production as the default and does not redesign any production shell
surface, protocol, runtime crate, Windows hook, or service behavior.

```text
Shell Studio (Vite, browser only)
          |
          v
@agent-os/shell-ui ports + deterministic fixtures
          |
          +-- FixtureShellAdapter (M02)
          +-- native thin adapters (M03+; not yet implemented)
```

## Repository ownership

- `agent-os-shell`: Seelen fork, shell surfaces, safe harness, shared shell UI, and Seelen integration.
- `agent-os-runtime`: contracts, App Server integration, voice control, policy, desktop graph, actions, journal,
  artifacts, automation, capture, watchdog, and any later narrowly scoped broker.

Process separation does not settle licensing obligations. Legal review is required before distribution.
