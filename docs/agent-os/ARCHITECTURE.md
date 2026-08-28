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

M00 records the unchanged baseline. M01 must establish runtime-mode isolation and a capability-based side-effect guard.
M02 must establish Shell Studio and deterministic fixtures. Production shell design work cannot begin before both gates
pass.

No Agent OS production behavior, protocol implementation, shell surface, runtime crate, Windows hook, or service change
exists in M00.

## Repository ownership

- `agent-os-shell`: Seelen fork, shell surfaces, safe harness, shared shell UI, and Seelen integration.
- `agent-os-runtime`: contracts, App Server integration, voice control, policy, desktop graph, actions, journal,
  artifacts, automation, capture, watchdog, and any later narrowly scoped broker.

Process separation does not settle licensing obligations. Legal review is required before distribution.
