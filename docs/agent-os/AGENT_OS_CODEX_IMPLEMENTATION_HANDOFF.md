# Agent OS on Seelen UI — Complete Codex Implementation Handoff

**Research snapshot:** 2026-08-27\
**Seelen UI baseline:** `eythaann/Seelen-UI` `master` at `b4708a1c1f2158d1ce05f6bfa27ddcbb31bcd695` (`2.8.3`)\
**Codex source snapshot inspected:** `openai/codex` at `2d929eb7c39a612b84e0987f2af4a4c2282249e2`\
**Primary target:** Windows 11 x64\
**Document purpose:** This is an implementation contract for Codex. Execute the work in milestone order. Do not skip the
safety and preview milestones.

---

## 1. Executive decision

Build Agent OS as **a maintained fork of Seelen UI plus a separate Agent OS runtime**.

Do not implement this as only a Seelen theme or third-party widget bundle. Themes and widgets are useful for proving
visuals, but they cannot safely provide all required capabilities:

- a non-invasive shell development mode;
- a trusted semantic desktop control bridge;
- a local policy and approval broker independent of the model;
- crash recovery and native taskbar restoration;
- a persistent Codex App Server lifecycle;
- realtime voice transport and thread routing;
- system-wide state tracking and action journaling.

The fork must stay narrow and upstream-friendly. Keep Agent OS code in clearly named modules and packages rather than
rewriting unrelated Seelen internals.

Use two repositories:

1. **`agent-os-shell`** — fork of Seelen UI. This remains subject to Seelen's AGPL-3.0-or-later license. It owns shell
   surfaces, the safe harness, Seelen integration, and the user-facing UI.
2. **`agent-os-runtime`** — new Rust workspace. It owns Codex App Server integration, voice session control, MCP tools,
   desktop state, UI Automation, policy, journal/undo, artifact management, watchdog, and the optional elevated/UIAccess
   broker.

The runtime and shell communicate through an authenticated, versioned, per-user Windows named-pipe protocol. They are
separate processes and separate crash domains.

### Product thesis

Codex is not a chatbot placed on top of Windows. Codex is the intelligence and coordination layer of the desktop. Seelen
is the shell and semantic control surface. Windows applications remain real applications.

The resting desktop should be nearly invisible as a product: a clean workspace and a small voice orb. UI appears only
when it improves the user's ability to understand, decide, review, or manipulate an artifact.

### Hard truth about “control everything”

Agent OS should control everything available to the current interactive user session and allowed by Windows policy,
using this order:

1. first-party semantic Seelen command;
2. application API, connector, or MCP tool;
3. Windows UI Automation control pattern;
4. verified keyboard/mouse interaction;
5. window capture plus vision as a last resort.

It must not attempt to bypass the secure desktop, UAC consent UI, lock screen, Secure Attention Sequence, Windows
integrity boundaries, or user policy. Those are intentional operating-system boundaries, not missing features.

---

## 2. Non-negotiable implementation rules

1. **Never use the live shell as the ordinary development loop.** UI work starts in Shell Studio. Native verification
   happens in Harness Mode. Real shell hooks run only in a disposable Windows environment until release-candidate gates
   pass.
2. **The model never directly owns pixels, HWNDs, raw coordinates, CSS, permissions, or elevation.** Codex emits intents
   and calls typed tools. Deterministic local code validates and executes them.
3. **The user always wins control immediately.** Mouse, keyboard, the emergency chord, clicking the orb, or saying stop
   must cancel or pause autonomous activity.
4. **Do not expose an arbitrary PowerShell or process-spawn API as an Agent OS MCP tool.** Codex already has its own
   sandboxed command execution for coding work. OS actions must go through typed tools and the local policy broker.
5. **Every consequential action is observed and verified.** A successful API call is not sufficient. Record the before
   state, execute, observe the after state, and report whether the intended state actually occurred.
6. **Every UI change needs a fixture and visual evidence.** No screenshot fixture means the UI change is not finished.
7. **Every action needs a risk classification.** Any action capable of external communication, deletion, installation,
   privilege change, security change, or irreversible data mutation requires explicit policy treatment.
8. **No microphone access before a clear user gesture and visible indicator.** No always-listening wake word in v1.
9. **Do not rely on experimental upstream contracts without an adapter and feature flag.** Direct Codex thread realtime
   and MCP App UI support must be isolated behind interfaces.
10. **Follow upstream Seelen repository rules.** Use Svelte 5 APIs, modern backend module structure, generated
    command/event bindings, `cargo check` for iteration, and the repository's lock-ordering rules.

---

## 3. Findings from the current Seelen codebase

Codex must confirm these findings against the pinned baseline before changing code.

### 3.1 Seelen is an appropriate shell foundation

Seelen already provides:

- a Rust and Tauri backend;
- Svelte/TypeScript and React UI surfaces;
- a custom dock, toolbar, launcher, task switcher, flyouts, notifications, widgets, and virtual workspaces;
- tiling and window positioning;
- typed backend commands and typed backend events;
- per-monitor widget instances and overlay/popup/desktop widget presets;
- CSS/JSON theming and resource hot-loading;
- Windows named-pipe IPC between the app and service.

The current typed command declaration already covers workspaces, windows, app launch, focus, media, brightness, network,
Bluetooth, notifications, clipboard, focus assist, system state, power, and widget operations. The event declaration
already exposes focus, windows, workspace, WM tree, notifications, clipboard, media, system, and other state changes.

Relevant paths:

- `libs/core/src/handlers/commands.rs`
- `libs/core/src/handlers/events.rs`
- `documentation/widget-js-api.md`
- `src/background/widgets/manager.rs`
- `src/background/widgets/loader.rs`
- `src/background/widgets/webview.rs`
- `libs/slu-ipc/`

### 3.2 The existing development mode is unsafe for this project

The current root `dev` script performs a Rust build and launches `tauri dev`. Tauri's development URL is backed by the
custom UI build server. The actual application startup can start the service, reconcile real widgets, register hooks and
shortcuts, create background windows, and hide the native taskbar when Seelen's dock is enabled.

There is no existing first-class “render the shell in a normal test window without touching Windows” mode. There is also
no real root JavaScript test script and no existing visual-regression suite.

Therefore the first production change is not the orb. It is **runtime-mode isolation and the safe preview system**.

Relevant paths:

- `package.json`
- `src/tauri.conf.json`
- `scripts/build.ts`
- `scripts/build/server.ts`
- `src/background/main.rs`
- `src/background/app.rs`
- `.github/workflows/ci.yml`

### 3.3 Seelen widgets are useful but not a complete trust boundary

The widget system supports isolated webviews, runtime instances, liveness checks, multiple presets, and typed
invokes/subscriptions. That is excellent for Agent OS surfaces.

However, the current third-party widget permission manager explicitly protects only `Run` and `OpenFile`, while bundled
widgets receive automatic access. Agent OS needs a separate host-level policy system. Do not extend the existing widget
permission enum until it becomes the OS policy engine; keep the Agent OS policy broker independent and authoritative.

### 3.4 The existing named-pipe implementation is a starting point, not the final agent protocol

Seelen already has per-session pipes, retries, timeouts, and a service signature check. Agent OS requires a persistent
duplex channel, streaming events, schema negotiation, backpressure, per-user ACLs, and an ephemeral session secret. Do
not reuse a static signature as the only authentication mechanism.

---

## 4. Findings from the current Codex platform

### 4.1 Use Codex App Server, not terminal scraping

Codex App Server is the first-class way to embed the complete Codex harness into a custom client. It provides:

- ChatGPT authentication;
- durable threads and turns;
- streaming item lifecycle events;
- approvals initiated by the server;
- sandboxed command/file work;
- skills and MCP servers;
- model and configuration discovery;
- generated TypeScript and JSON Schema protocol output.

Launch a pinned platform-specific `codex app-server` as a long-lived child process and communicate over bidirectional
JSONL/stdio. Do not use the experimental App Server WebSocket listener as the primary local transport.

### 4.2 Voice is productized, but the direct App Server realtime surface is experimental

Official Codex Voice is available on eligible desktop accounts and uses the tools and permissions available to Codex.
The open Codex source currently exposes thread-scoped realtime operations, including WebRTC, microphone audio, streamed
transcript text, output audio, voice selection, interruption, session start/stop, and handoff configuration.

The direct `thread/realtime/*` protocol structures are marked experimental. Treat this as a mandatory feasibility gate:

- pin the Codex binary;
- generate protocol schemas from that exact binary;
- wrap realtime behind `VoiceBackend`;
- run contract tests on every Codex binary upgrade;
- keep a text-input fallback;
- do not allow protocol details to leak into the shell component library.

### 4.3 App Server events can drive rich Agent OS surfaces

App Server items include plan, command execution, file changes, MCP tool calls, image generation, image viewing, and
agent messages. The current image-generation item includes status, revised prompt, transparent-background state, result,
and an optional saved path. Map those item types into deterministic Agent OS surfaces instead of presenting a chat
transcript.

### 4.4 MCP App UI is valuable but must be sandboxed and feature-gated

The App Server initialization protocol can advertise MCP UI support for `text/html;profile=mcp-app`. MCP tool-call items
can carry app context and resource URIs. Agent OS should be capable of rendering approved MCP UI resources in an
isolated webview.

This is not permission to let arbitrary MCP HTML access the shell bridge. MCP App surfaces get a dedicated sandbox,
strict navigation policy, strict CSP, no Tauri bridge, and no microphone/clipboard/file permissions unless separately
granted.

---

## 5. Target architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Windows interactive user session                                         │
│                                                                          │
│  ┌────────────────────── agent-os-shell (Seelen fork) ────────────────┐ │
│  │ Voice Orb · Activity Capsule · Stage · Approval Sheet · Widgets     │ │
│  │ Workspace/window shell · Native state adapters · Surface Manager    │ │
│  │ Safe Harness runtime · Agent Bridge                                 │ │
│  └──────────────────────────────┬──────────────────────────────────────┘ │
│                                 │ authenticated named pipe               │
│  ┌──────────────────────────────▼──────────────────────────────────────┐ │
│  │ agent-os-host                                                       │ │
│  │ Runtime coordinator · Experience Orchestrator · Policy Broker       │ │
│  │ Desktop State Graph · Action Engine · Journal/Undo · Artifact Store │ │
│  │ App Server client · Voice backend · UIA backend · Capture backend   │ │
│  └──────────────┬──────────────────────────────┬───────────────────────┘ │
│                 │ stdio JSONL                 │ local broker protocol    │
│  ┌──────────────▼────────────┐    ┌───────────▼──────────────────────┐ │
│  │ pinned codex app-server  │    │ optional elevated/UIAccess broker│ │
│  │ threads · turns · voice  │    │ narrow allowlist · signed        │ │
│  │ auth · skills · MCP      │    └──────────────────────────────────┘ │
│  └──────────────┬────────────┘                                         │
│                 │ starts stdio MCP server                              │
│  ┌──────────────▼────────────────────────────────────────────────────┐ │
│  │ agent-os-mcp relay                                                │ │
│  │ typed Agent OS tools → authenticated host channel                 │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────── agent-os-watchdog ──────────────────────────┐ │
│  │ heartbeat · crash-loop guard · restore taskbar/hooks · safe mode  │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Why the runtime is separate from the shell

- The shell can crash without killing active Codex tasks.
- Codex can restart without taking down the user's desktop.
- The watchdog can restore Windows when the shell is unhealthy.
- The policy boundary is native and independent of webview code.
- The Seelen fork remains smaller and easier to sync with upstream.
- The runtime can be tested without installing the shell.
- The AGPL shell and runtime licensing can be reviewed separately. Do not assume process separation automatically
  resolves license obligations; obtain legal review before commercial distribution.

### 5.2 Runtime thread model

Do not use a single eternal thread for every activity.

Maintain:

- one **Coordinator thread** for voice, desktop orchestration, and task routing;
- one durable **project thread** per recognized code/project workspace;
- optional ephemeral threads for quick questions or sensitive tasks;
- child/subagent threads created by Codex when appropriate.

The Coordinator receives a compact active-context summary and has Agent OS MCP tools. Project threads receive project
roots and normal workspace-write Codex permissions. The Coordinator must not get unrestricted shell access merely
because the user wants desktop control.

---

## 6. Repository and branch strategy

### 6.1 `agent-os-shell`

Create a fork of `eythaann/Seelen-UI`.

Recommended remotes:

```text
origin    <your Agent OS fork>
upstream  https://github.com/eythaann/Seelen-UI.git
```

Recommended branches:

- `upstream-master` — exact mirror of upstream `master`;
- `main` — releasable Agent OS shell;
- `codex/Mxx-description` — one work-package branch per milestone.

Automate a weekly upstream-sync pull request. Never merge upstream directly into a release branch without running the
shell, harness, visual, and Windows integration suites.

Add:

- `UPSTREAM_BASELINE.md` — upstream SHA, version, date, known local patches;
- `UPSTREAM_PATCHES.md` — a concise list of every modified upstream subsystem and why;
- `docs/agent-os/ARCHITECTURE.md`;
- an Agent OS section in root `AGENTS.md` that points to this handoff and states the safe-development rules.

### 6.2 `agent-os-runtime`

Create a new Rust workspace with these initial members:

```text
agent-os-runtime/
  Cargo.toml
  crates/
    agent-contracts/
    app-server-client/
    runtime-core/
    desktop-graph/
    action-engine/
    experience-orchestrator/
    policy-engine/
    journal/
    artifacts/
    windows-automation/
    windows-capture/
    shell-client/
  bins/
    agent-os-host/
    agent-os-mcp/
    agent-os-watchdog/
    agent-os-uiaccess-broker/     # disabled until its milestone
  generated/
    codex-schema/
    shell-types/
  tests/
    fixtures/
    protocol/
    replay/
  tools/
    codex-manifest/
```

The `agent-contracts` crate is the source of truth for shell/runtime messages. Generate TypeScript from it and package
the generated types for the shell. The shell and runtime perform a protocol-version handshake and fail gracefully with a
clear update message on incompatible major versions.

---

## 7. Safe runtime modes

Add an explicit mode enum to the shell:

```rust
pub enum RuntimeMode {
    Studio,      // Browser-only; represented outside the native binary
    Harness,     // Native normal window; zero shell side effects
    Integration, // Full shell behavior only in disposable test environment
    Production,  // Installed shell
    SafeMode,    // Native Windows behavior restored; diagnostics only
}
```

### 7.1 Do not trust only an environment variable

Create a `ShellEffectCapability` value that can only be constructed by the production/integration bootstrap after
explicit checks. Side-effecting services require this capability in their constructor.

The following operations must be impossible in Harness Mode:

- hide or alter the native taskbar;
- register the global Windows event hook;
- install or start the Seelen service;
- alter autostart;
- register global shortcuts;
- register AppBars;
- change wallpaper, workspaces, native shell state, focus-assist state, network, power, or brightness;
- open real overlay/desktop webviews outside the harness window;
- use production pipe names or production data/cache directories;
- run updater or installer logic.

### 7.2 Separate Tauri harness configuration

Add `src/tauri.harness.conf.json` with:

- a distinct product name and application identifier;
- a normal decorated resizable window;
- no updater/autostart configuration;
- a unique WebView2 data directory;
- no production capabilities;
- a title that `winapp ui` can target reliably, such as `Agent OS Shell Harness`.

Add a dedicated bootstrap path rather than trying to let the production startup run and no-op individual calls.

### 7.3 Harness backends

Define ports and inject one of two adapters:

- `RealShellAdapter` — invokes real typed Seelen commands and listens to real events;
- `FixtureShellAdapter` — uses in-memory monitors, windows, workspaces, notifications, artifacts, and agent events.

All Agent OS Svelte components must depend on the adapter interface, not directly on Tauri.

---

## 8. The complete preview and debugging loop

This is a product requirement, not developer convenience.

### Level A — Shell Studio: default UI loop

Create `tools/shell-studio`, a standalone Svelte 5/Vite application that imports the exact same component package used
by Seelen's Agent OS widgets.

Recommended shell package layout:

```text
agent-os-shell/
  libs/
    agent-shell-ui/
      src/
        components/
        surfaces/
        state/
        ports/
        tokens/
        accessibility/
  tools/
    shell-studio/
      src/
        scenarios/
        replay/
        controls/
      tests/
        visual/
        aria/
        interactions/
      playwright.config.ts
```

Shell Studio must provide:

- desktop viewport presets: 1366×768, 1920×1080, 2560×1440, ultrawide;
- CSS scale/DPI presets approximating 100%, 125%, 150%, and 200%;
- light, dark, high-contrast, and reduced-motion modes;
- one- and multi-monitor canvases;
- deterministic fake clock, UUIDs, random values, and network latency;
- inspectable current `AgentRuntimeState` and `SurfacePlan`;
- selectable fixtures and recorded trace replay;
- controls to inject user speech, agent transcript, plan, command, image-generation, MCP tool, approval, error,
  cancellation, reconnection, and multi-agent events;
- no Windows hooks or native shell calls.

Required fixtures:

```text
idle
hovered
text-composer-open
listening
user-speaking
thinking
planning
acting-single-step
acting-multi-step
waiting-for-approval
approval-denied
interrupted
offline
reconnecting
error-recoverable
error-fatal
result-summary
image-generating
image-complete
image-editing
mcp-app-loading
mcp-app-ready
workspace-composer
multi-agent-progress
reduced-motion
high-contrast
```

Use Playwright for:

- `toHaveScreenshot` visual comparisons;
- ARIA snapshots;
- keyboard navigation;
- focus order;
- interaction tests;
- trace collection on failure.

Generate and compare screenshots on a fixed Windows CI image because rendering and fonts vary by operating system.
Snapshot updates must require an explicit command and human review in the pull request.

### Level B — Native Harness Mode

Run the real Tauri/WebView2 host as a normal application window with fixture adapters. Use it to verify:

- WebView2 rendering and transparency;
- microphone permission flow;
- WebRTC negotiation;
- native IPC reconnect behavior;
- high-DPI behavior;
- keyboard focus and accessibility;
- process crash/restart handling;
- real app-server event replay.

Use Microsoft's pinned `winapp ui` CLI in development and CI to:

- inspect the harness accessibility tree;
- invoke buttons through UIA patterns;
- wait for states;
- capture the actual DWM-composited window;
- record native interaction evidence;
- verify popups and approval sheets.

`winapp ui` is currently a public-preview dependency. Pin its version and isolate it behind test scripts. Do not make
the production action engine depend permanently on the CLI contract.

### Level C — Disposable Windows integration lab

Use two environments:

1. **Windows Sandbox** for clean installer and basic shell smoke tests. Use a `.wsb` file with:
   - a read-only mapped build/package directory;
   - a separate writable artifact directory;
   - networking disabled by default;
   - clipboard disabled unless the test requires it;
   - audio input enabled only for voice tests;
   - a logon command that installs/runs the candidate, executes the test plan, writes evidence, and shuts down.
2. **Hyper-V checkpoint VM** for tests that need a persistent prepared image, full voice authentication, multiple
   applications, or repeated integration runs. Revert to a clean checkpoint after every run.

Never use real personal credentials in the disposable lab. Use a dedicated test account and synthetic files.

### Level D — Canary on a real machine

Allow only after all prior gates pass. Requirements:

- watchdog active;
- emergency chord tested;
- taskbar restoration tested;
- crash-loop protection tested;
- safe-mode command tested;
- last-known-good configuration available;
- uninstall/rollback tested.

### Required developer commands

Add a root `justfile` or equivalent scripts:

```text
just setup
just check
just studio
just studio-test
just studio-update-snapshots
just harness
just harness-replay <trace>
just harness-test
just protocol-check
just sandbox-package
just sandbox-smoke
just integration-vm
just canary
just diagnose
```

The default `just studio` command must not compile Rust.

---

## 9. Visual and interaction direction

The goal is “Apple-level calm and finish,” not a visual copy of macOS.

### 9.1 Resting state

At rest, the shell shows:

- the user's current windows/workspace;
- no dashboard;
- no permanent AI sidebar;
- no giant assistant;
- no persistent transcript;
- one small monochrome orb near the bottom center, where a dock would traditionally live.

A manual dock/launcher remains available through a configurable shortcut and deliberate bottom-edge reveal. It is a
fallback, not the visual center of the OS.

### 9.2 Design tokens

Use system-native `Segoe UI Variable` first. Do not require Apple fonts.

Create a versioned Agent OS token package:

- spacing: 4, 8, 12, 16, 24, 32;
- radii: 8, 12, 16; circular only for the orb and explicit icon buttons;
- type roles: caption, body, emphasized body, title, display;
- neutral surfaces with restrained wallpaper-derived accent;
- no rainbow gradients or “AI neon” treatment;
- blur only on small transient surfaces; artifact stages should remain readable and mostly opaque;
- subtle shadow and one-pixel keyline instead of heavy floating cards;
- motion: fast ease-out, no bounce, no exaggerated spring, no parallax;
- reduced-motion mode removes translation/scale and retains opacity transitions only.

Suggested motion targets:

- hover/press: 90–120 ms;
- orb-to-capsule: 160–220 ms;
- sheet/stage appearance: 180–240 ms;
- dismissal: 120–180 ms.

These are design targets, not hardcoded values across every component.

### 9.3 Surface hierarchy

Agent OS has six sanctioned native surfaces:

1. **Orb** — idle, listening, speaking, thinking, error, and interrupt affordance.
2. **Capsule** — one-line transcript, current step, compact progress, or completion.
3. **Sheet** — confirmation, choice, form, or short review. Anchored near the orb unless context requires another
   location.
4. **Stage** — image, diff, document, artifact, complex result, or multi-agent overview requiring sustained attention.
5. **Sidecar** — optional contextual surface beside the active application when requested or clearly helpful.
6. **Toast** — brief, non-blocking completion or undo affordance.

There is no generic “AI dashboard.”

### 9.4 Accessibility requirements

- complete keyboard operation;
- visible focus treatment;
- semantic roles and accessible names;
- ARIA snapshot tests;
- high-contrast support;
- reduced motion;
- text scaling without clipped content;
- captioned voice transcript available on demand;
- never use color as the sole state indicator.

---

## 10. Agent runtime state machine

Implement a single authoritative state machine in the runtime and mirror it into the shell.

```text
Dormant
  → Ready
  → Listening
  → UserSpeaking
  → Thinking
  → Planning
  → Acting
  → WaitingForApproval
  → PresentingResult
  → Ready

Any active state
  → Interrupted
  → Ready

Any state
  → Reconnecting
  → prior stable state or Error

Any state
  → Error
  → Ready or SafeMode
```

State transitions include:

- `thread_id`, `turn_id`, and `item_id` correlation;
- transcript preview;
- current action summary;
- progress value only when meaningful;
- whether input is accepted;
- whether user interruption is available;
- current surface-plan revision;
- approval request, if any;
- recoverability and retry action on errors.

Do not let individual widgets infer global agent state independently.

---

## 11. Experience Orchestrator: how Codex changes the UI intelligently

The model may suggest **what needs to be presented**, but it may not send arbitrary HTML, coordinates, or layout
instructions to the trusted shell.

### 11.1 Two inputs to presentation

1. **Automatic item mapping** — deterministic mappings from App Server events:
   - transcript delta → capsule;
   - plan/status → capsule or compact timeline;
   - approval request → sheet;
   - command/file-change activity → capsule, expandable details;
   - image generation → image stage;
   - diff or file artifact → artifact stage;
   - MCP App resource → sandboxed app stage or sidecar;
   - completed turn → summary/toast/collapse.
2. **Presentation intent tool** — Codex may call `experience.suggest` when it knows a visual would materially help. This
   returns a proposal, not an instruction.

### 11.2 Proposal schema

```json
{
  "proposalId": "uuid",
  "purpose": "show_artifact | ask_choice | request_approval | show_progress | compare | compose_workspace | inform",
  "preferredSurface": "capsule | sheet | stage | sidecar | toast | auto",
  "urgency": "blocking | requested | helpful | background",
  "focusRequest": "none | soft | explicit",
  "blocks": [
    { "type": "markdown", "artifactId": "..." },
    { "type": "image", "artifactId": "..." },
    { "type": "choice", "choiceSetId": "..." }
  ],
  "dismissal": "automatic | user | task_end",
  "ttlMs": 5000
}
```

The Experience Orchestrator validates the proposal and emits a normalized `SurfacePlan`.

### 11.3 Deterministic presentation policy

- Never steal keyboard focus while the user is typing unless a blocking approval is required or the user explicitly
  requested a surface.
- Use voice-only output when no visual adds value.
- Use the capsule for status, not the stage.
- Use a sheet for decisions and approval, not a generic chat pane.
- Use the stage only for content that benefits from sustained visual attention.
- Show at most one focal surface at a time.
- Defer non-urgent surfaces until the user is idle.
- Place the surface on the monitor containing the active window unless the user pinned it elsewhere.
- Collapse after completion unless the result requires review.
- Preserve a result in the Artifact Shelf even after the visible surface closes.
- Respect reduced motion and presentation-mode/privacy settings.
- Reject unknown block types, external navigation, oversized payloads, and raw HTML.

### 11.4 Surface plan example

```json
{
  "revision": 42,
  "surface": "stage",
  "placement": { "monitor": "active", "anchor": "center" },
  "focus": "explicit",
  "blocks": [
    {
      "type": "imageCanvas",
      "artifactId": "artifact:image:73",
      "fit": "contain"
    },
    {
      "type": "actionBar",
      "actions": ["copy", "saveAs", "setWallpaper", "editAgain"]
    }
  ]
}
```

---

## 12. Core Agent OS surfaces and widgets

Build these in order. Only the orb is persistently visible by default.

### 12.1 Voice Orb

Responsibilities:

- click-to-talk and configurable push-to-talk;
- click to open a compact text composer;
- visible microphone state;
- interruption affordance;
- states: ready, listening, speaking, thinking, acting, approval, disconnected, error;
- move or hand off to the active monitor without distracting animation;
- no waveform theater when audio is silent.

### 12.2 Activity Capsule

Responsibilities:

- live transcript preview;
- concise current step;
- agent count/status when several tasks are coordinated;
- expandable technical details on demand;
- cancel/pause control;
- never show raw chain of thought.

### 12.3 Approval Sheet

Responsibilities:

- exact action and target;
- data that will leave the machine or be changed;
- risk level;
- why the action is required;
- scope buttons: deny, allow once, allow for this workflow when permitted;
- no permanent allow option for highest-risk actions;
- keyboard and voice response;
- timeout and safe default to deny.

### 12.4 Result Stage

A composable surface for:

- markdown/document preview;
- diff/review;
- command output;
- generated image;
- multi-agent result;
- file/artifact preview;
- sandboxed MCP App UI.

### 12.5 Image Studio

Primary data source: Codex App Server image-generation item. Optional fallback: direct OpenAI image backend behind a
separate configuration and billing boundary.

Capabilities:

- live generation state;
- generated image and revised prompt;
- transparent-background indication;
- variations/edit request;
- copy, save as, reveal, open in editor, and set as wallpaper;
- artifact metadata and provenance;
- no automatic wallpaper replacement unless the user requested it;
- store results under the Agent OS artifact directory rather than arbitrary project folders.

Use the current supported OpenAI image model selected by the backend. Do not hard-code a model alias in the UI.

### 12.6 Workspace Composer

A visual explanation of what the agent is about to arrange:

- workspace name and purpose;
- applications to launch;
- target layout;
- saved reusable workspace recipes;
- preview in Harness Mode;
- undo/restore previous arrangement.

### 12.7 Artifact Shelf

An on-demand, non-persistent-by-default panel containing recent:

- images;
- diffs;
- documents;
- terminal reports;
- screenshots;
- generated workspace recipes.

### 12.8 Context Lens

On-demand contextual view of the focused app/window:

- application identity;
- relevant project/document when determinable;
- available semantic actions;
- compact UIA tree excerpt only when requested;
- privacy indicator when capture or sensitive text is involved.

### 12.9 Briefing Card

Optional summoned widget for calendar, tasks, notifications, and status. It must use connected apps/MCP where available
rather than scraping application UIs. It is not an always-on dashboard.

### 12.10 Sandboxed MCP App Surface

Render supported MCP UI resources in a dedicated restricted webview:

- no Tauri API injection;
- no Agent OS named-pipe access;
- strict CSP and resource-domain allowlist;
- no arbitrary external navigation;
- explicit permission mediation for clipboard, downloads, microphone, camera, and local files;
- fallback to structured content/markdown when unsupported.

---

## 13. Codex App Server integration

### 13.1 Binary strategy

For the first implementation, require an installed/pinned Codex binary or download a pinned official binary into the
Agent OS runtime directory after verifying its hash. Do not silently use whatever `codex` happens to be on `PATH` in
production.

Create `tools/codex-manifest/codex.version.json`:

```json
{
  "version": "pinned-version",
  "protocolSchemaSha256": "...",
  "artifacts": {
    "windows-x64": {
      "sha256": "...",
      "source": "official"
    }
  }
}
```

Review Codex licensing and product terms before redistributing its binary.

### 13.2 Generated protocol

On binary upgrade:

```text
codex app-server generate-json-schema --out generated/codex-schema
codex app-server generate-ts --out generated/codex-ts
```

Generate Rust types for the subset used by Agent OS or maintain carefully tested typed request/response structs. CI
regenerates schemas and fails on drift.

### 13.3 Lifecycle

1. Spawn App Server with stdio transport.
2. Capture stderr separately as structured diagnostic logs.
3. Send `initialize` with stable `clientInfo` and required capabilities.
4. Send initialized notification.
5. Read account state.
6. If needed, start ChatGPT login and present authentication UI.
7. Load/create Coordinator and project threads.
8. Configure the Agent OS MCP relay for Coordinator sessions.
9. Start turns and stream item/turn/thread notifications.
10. Handle server-initiated approvals.
11. Persist thread-to-project and thread-to-workspace mappings.
12. On crash, restart App Server and resume relevant threads.

### 13.4 Backpressure and health

- bounded inbound/outbound channels;
- exponential backoff on overload/restart;
- heartbeat and process-exit detection;
- never block the shell UI thread on App Server I/O;
- surface degraded/reconnecting state rather than freezing;
- redact tokens and secrets from logs.

### 13.5 Permission profiles

Use separate profiles:

- **Coordinator:** no unrestricted shell; Agent OS MCP plus approved connectors and skills.
- **Project coding thread:** workspace-write only for explicit project roots, normal Codex approvals, no automatic
  OS-level control.
- **Ephemeral sensitive thread:** minimal history and capability set.

Do not start every turn with full access.

---

## 14. Realtime voice implementation

### 14.1 Mandatory Voice Gate spike

Before building the full shell voice UI, create a minimal WebView2 test app that proves all of the following against the
pinned App Server and the intended user account:

- authentication succeeds;
- realtime voices can be listed when supported;
- a WebRTC session starts;
- microphone audio reaches the session;
- user and assistant transcript deltas arrive;
- assistant audio plays;
- the session can invoke an Agent OS MCP test tool;
- barge-in/interrupt works;
- session stop and reconnect work;
- a project thread can be selected before realtime starts.

Do not proceed to the complete voice milestone until this gate passes.

### 14.2 WebRTC ownership

The orb webview owns:

- `RTCPeerConnection`;
- microphone `MediaStreamTrack`;
- the realtime event data channel;
- audio playback;
- local mute/ducking;
- user-facing permission state.

The runtime owns:

- App Server requests and notifications;
- selected thread and project context;
- SDP relay;
- policy and tool execution;
- session lifecycle and reconnection;
- transcript persistence rules.

### 14.3 Session sequence

1. User clicks orb or presses push-to-talk.
2. Shell requests microphone permission through the host-controlled WebView2 permission flow.
3. Shell creates peer connection, adds mic track, creates data channel, and creates an SDP offer.
4. Shell sends offer to runtime over Agent OS IPC.
5. Runtime calls the pinned App Server thread-realtime start method for the selected thread and forwards the SDP.
6. App Server emits remote SDP; runtime forwards it to shell.
7. Shell sets remote description and starts duplex audio.
8. Runtime maps transcript and Codex item events into state/surfaces.
9. User interruption immediately ducks audio and sends the appropriate interrupt/steer signal.
10. On end, runtime flushes the supported transcript tail, stops the session, and returns to Ready.

### 14.4 Voice privacy

- no microphone capture before user gesture;
- persistent visible indicator while capturing;
- one-click mute and stop;
- optional transcript retention, disabled or minimized in privacy mode;
- never put captured audio in the action journal;
- do not expose microphone access to MCP App webviews;
- no wake word in v1.

### 14.5 Voice adapter

```rust
#[async_trait]
pub trait VoiceBackend {
    async fn list_voices(&self) -> Result<Vec<Voice>>;
    async fn start(&self, request: StartVoiceRequest) -> Result<VoiceSession>;
    async fn apply_remote_sdp(&self, ...);
    async fn interrupt(&self, ...);
    async fn stop(&self, ...);
}
```

Implement:

- `CodexAppServerRealtimeBackend` — primary;
- `TextOnlyVoiceFallback` — keeps the product usable when realtime is unavailable;
- optional direct OpenAI realtime backend only if separately approved as a product fallback.

---

## 15. Desktop State Graph

Maintain an authoritative local state graph. Do not repeatedly ask Codex to infer basic state from screenshots.

### 15.1 Entities

- user session;
- monitor;
- workspace;
- window;
- application/process;
- focused context;
- UI Automation element snapshot;
- notification;
- clipboard metadata;
- media session;
- Agent OS task;
- artifact;
- approval;
- action and undo token.

### 15.2 Stable references

Never expose a bare HWND as the primary model-facing identifier. Use an opaque reference derived from:

- HWND;
- process ID;
- process start time;
- window creation/observation sequence.

Reject stale references.

### 15.3 Snapshot shape

```json
{
  "revision": 812,
  "activeMonitor": "monitor:1",
  "activeWorkspace": "workspace:dev",
  "focusedWindow": "window:4f9b",
  "windows": [
    {
      "id": "window:4f9b",
      "app": "Visual Studio Code",
      "title": "agent-os-runtime",
      "workspace": "workspace:dev",
      "bounds": [0, 0, 1280, 1400],
      "state": "normal"
    }
  ],
  "agentTasks": [],
  "privacy": { "redacted": false }
}
```

### 15.4 Context budget

The Coordinator receives a compact summary. Full window lists, UIA trees, screenshots, clipboard content, and
notification content are tool results requested only when needed.

### 15.5 Event sources

Subscribe to Seelen's typed events for windows, focus, workspaces, WM tree, notifications, clipboard, media, network,
and system state. Coalesce noisy events and assign monotonic sequence numbers.

---

## 16. Action engine

Every model-facing tool call passes through:

```text
resolve intent
  → validate schema
  → resolve stable references
  → classify risk
  → evaluate policy
  → request approval if needed
  → capture before state
  → execute through selected backend
  → observe after state
  → verify postcondition
  → write journal entry
  → return structured result and optional undo token
```

### 16.1 Action envelope

```json
{
  "actionId": "uuid",
  "tool": "window.move",
  "arguments": {},
  "origin": {
    "threadId": "...",
    "turnId": "...",
    "itemId": "..."
  },
  "expectedStateRevision": 812,
  "idempotencyKey": "...",
  "deadlineMs": 10000,
  "userIntentId": "...",
  "justification": "Arrange development workspace"
}
```

### 16.2 Action result

```json
{
  "actionId": "uuid",
  "status": "succeeded | failed | partially_succeeded | cancelled | denied",
  "observedBefore": {},
  "observedAfter": {},
  "verification": {
    "passed": true,
    "evidence": ["state_revision:813"]
  },
  "undoToken": "undo:...",
  "warnings": []
}
```

### 16.3 Idempotency and races

- require idempotency keys for launches, creates, sends, and other duplicate-sensitive actions;
- check expected graph revision when an action depends on current layout;
- re-resolve UIA elements immediately before input;
- cancel if the foreground target changes unexpectedly;
- serialize conflicting window/workspace actions;
- let independent monitor/app actions run concurrently.

---

## 17. Agent OS MCP tool contract

Build a narrow MCP relay process started by Codex. It connects to the runtime through a per-session authenticated pipe.
The relay contains no privileged business logic.

### 17.1 Initial tool set

#### Observe — default automatic

```text
desktop.get_snapshot
desktop.get_focused_context
desktop.wait_for
app.list
window.list
workspace.list
system.get_state
notification.list
artifact.list
ui.inspect
ui.find
ui.get_property
```

#### Reversible local actions — generally automatic with visible activity

```text
app.launch
app.activate
window.focus
window.set_bounds
window.set_state
window.move_to_workspace
workspace.create
workspace.rename
workspace.switch
workspace.compose
workspace.restore_previous
system.set_volume
system.set_brightness
system.set_focus_mode
notification.dismiss
clipboard.write
file.open
file.reveal
ui.invoke
ui.select
ui.scroll
experience.suggest
experience.dismiss
action.undo
action.cancel
```

#### Consequential or sensitive — policy/approval required as applicable

```text
app.close                       # when unsaved work may exist
clipboard.read                  # potentially sensitive
ui.set_value                    # may enter sensitive/external data
ui.send_keys
ui.click
ui.drag
system.change_network
file.delete
process.run_allowlisted_task
power.restart
power.shutdown
```

Sending messages, purchases, publishing, commits/pushes, deployments, account changes, installations, and security
changes should normally occur through their domain connector/Codex workflow and remain subject to both Codex approval
and Agent OS policy.

### 17.2 Tool design rules

- return structured JSON, not prose;
- use opaque entity references;
- include postcondition verification;
- expose capabilities, not raw APIs;
- do not expose arbitrary coordinate click until the verified fallback milestone;
- do not return secrets;
- describe approval needs in tool metadata;
- support cancellation and deadlines;
- make read tools cheap and bounded.

---

## 18. Windows application automation

### 18.1 Backend priority

```text
App-specific API/MCP
  → Windows UI Automation pattern
  → window-scoped message where safe
  → verified SendInput/click/drag
  → capture + vision + verified input
```

### 18.2 Development backend

Implement `WinAppCliAutomationBackend` first to prove workflows quickly. Pin the CLI version. Parse JSON output. Use
UIA-pattern verbs whenever available. Use its screenshot/recording capability for evidence.

This backend is temporary or optional because the CLI is in public preview and per-command process launch may be too
slow for the final product.

### 18.3 Production backend

Implement `NativeUiaAutomationBackend` in Rust using Windows UI Automation COM APIs.

Required operations:

- connect to window by stable reference;
- bounded tree inspect;
- find by AutomationId/name/control type;
- Invoke, Toggle, ExpandCollapse, SelectionItem, Value, RangeValue, Scroll, Text, and Window patterns;
- subscribe to relevant events;
- cache properties carefully and detect stale elements;
- return explicit capability lists for each element.

### 18.4 Input fallback

Input injection must:

- require an unlocked interactive desktop;
- foreground and verify the target;
- re-resolve element bounds just before input;
- reject moving/animating targets;
- reject system-reserved key combinations by default;
- abort when physical user input occurs;
- verify outcome after the input;
- never claim success solely because `SendInput` returned success.

Windows restricts `SendInput` across integrity levels. Do not run the main host elevated. Add a separate signed
UIAccess/elevated broker only when a proven workflow requires it.

### 18.5 Elevated/UIAccess broker

This milestone is disabled by default.

Requirements:

- separately signed executable;
- installed in a Windows secure location;
- minimal allowlist of operations;
- no arbitrary command execution;
- explicit high-risk approval;
- current-user/session binding;
- short-lived nonce and request signature;
- full audit entry;
- broker exits when idle;
- cannot interact with the secure desktop/UAC consent screen.

### 18.6 Vision fallback

Use Windows Graphics Capture to capture only the target window or approved region. Show privacy/capture state. Store
temporary captures in a restricted directory and delete them after the task unless the user saves them.

Send the screenshot to Codex only when semantic and UIA approaches fail. Have Codex identify a semantic target, then
independently verify coordinates and target stability before input.

---

## 19. Policy and approvals

### 19.1 Risk classes

- **R0 — Observe:** bounded state reads with no sensitive content.
- **R1 — Reversible local:** focus, arrange, launch, volume, workspace changes.
- **R2 — Sensitive/consequential:** clipboard content, text entry, closing unsaved work, network changes, input
  fallback.
- **R3 — External/irreversible/privileged:** send/publish/delete/install/elevate/security/power/payment/account changes.

### 19.2 Decision inputs

- risk class;
- whether the user explicitly requested the exact action in the current turn;
- target application/domain;
- data sensitivity;
- reversibility;
- active workflow grant;
- enterprise/user policy;
- whether physical user input has occurred since the plan;
- whether the target changed.

### 19.3 Approval rules

- R0: automatic, with privacy bounds.
- R1: automatic when directly related to current request; journal and expose Undo.
- R2: allow only under explicit current intent or approval.
- R3: always explicit immediately before execution; stale approvals expire.

The model cannot approve its own request. A Codex approval response and Agent OS policy approval are separate concepts
even if presented in one sheet.

### 19.4 Secrets

Use Windows Credential Manager/DPAPI-backed storage. Tools receive opaque handles, not secret values. Never include
tokens in model context, trace packs, screenshots, or logs.

---

## 20. IPC and trust boundary

### 20.1 Shell/runtime channel

Use a persistent, per-session named pipe with:

- ACL restricted to the current user SID and required process identities;
- random pipe suffix;
- ephemeral session secret passed through a protected bootstrap mechanism;
- length-delimited or JSONL framed messages;
- request IDs and streaming subscriptions;
- bounded queues and heartbeat;
- protocol major/minor version handshake;
- message-size limit;
- explicit reconnect and resync.

### 20.2 Message categories

```text
shell.hello / runtime.hello
shell.subscribe
runtime.state_snapshot
runtime.state_delta
shell.user_input
shell.voice_offer
runtime.voice_answer
runtime.surface_plan
shell.surface_event
runtime.approval_request
shell.approval_response
runtime.health
shell.health
```

### 20.3 Webview isolation

Agent OS webviews communicate only through typed Tauri commands/events to the shell backend. They never connect directly
to the runtime pipe. The shell backend validates the caller label and message shape.

---

## 21. Journal, undo, and trace replay

Use SQLite WAL in the runtime for:

- task metadata;
- action journal;
- before/after snapshots;
- approval records;
- undo tokens;
- artifact metadata;
- thread/project/workspace mapping;
- feature flags and compatibility state.

Do not store raw audio. Redact sensitive text according to policy.

### 21.1 Undo

Prioritize undo for:

- window/workspace arrangement;
- volume/brightness/focus mode;
- clipboard replacement when safe;
- wallpaper;
- notification dismissal where activation is reversible only if supported;
- file edits made through Codex's normal diff system.

Do not present Undo for actions that cannot actually be reversed.

### 21.2 Trace format

Create a redacted `.aostrace` bundle:

```text
manifest.json
runtime-events.jsonl
shell-events.jsonl
actions.jsonl
surface-plans.jsonl
screenshots/                # opt-in/redacted
versions.json
```

All events use deterministic envelopes:

```json
{
  "seq": 1002,
  "monotonicMs": 15230,
  "source": "app-server | runtime | shell | policy | automation",
  "type": "...",
  "correlationId": "...",
  "payload": {}
}
```

Shell Studio and Harness Mode must replay this format.

---

## 22. Watchdog, recovery, and safe mode

Create `agent-os-watchdog.exe` as a minimal native process.

Responsibilities:

- monitor shell and runtime heartbeat;
- on shell failure, restore native taskbar state and unregister Agent OS hooks/reservations;
- restart shell once when safe;
- detect crash loops;
- disable Agent OS autostart after repeated startup failures;
- launch Safe Mode diagnostics;
- preserve last-known-good configuration;
- expose a global emergency chord handled outside the webview.

Safe Mode must:

- leave Windows/Explorer controls visible;
- start no overlay widgets;
- start no Codex or voice session automatically;
- allow viewing logs, resetting config, disabling features, and uninstalling/rolling back.

Required recovery tests:

- kill shell process during taskbar replacement;
- kill runtime while shell is active;
- kill App Server during voice;
- corrupt current config;
- start incompatible protocol versions;
- simulate three startup crashes;
- invoke emergency chord while agent is injecting input.

---

## 23. Testing strategy

### 23.1 Unit tests

- state-machine transitions;
- surface proposal normalization;
- risk classification;
- approval expiration;
- action idempotency;
- stale entity detection;
- context redaction;
- event coalescing;
- protocol version negotiation;
- undo generation;
- App Server event mapping;
- Codex schema parsing.

### 23.2 Contract tests

- regenerate Codex schema from pinned binary;
- initialize handshake fixture;
- thread start/resume fixture;
- approval request/response fixture;
- realtime start/SDP/transcript/error/close fixture;
- image-generation item fixture;
- MCP tool-call app-context fixture;
- shell/runtime protocol compatibility.

### 23.3 UI tests

- every fixture in every theme/motion mode;
- screenshots at required viewport/DPI presets;
- ARIA snapshots;
- keyboard-only operation;
- focus restoration after sheets/stages close;
- no clipped text at 200% scale;
- orb and capsule hit targets;
- approval cannot be triggered accidentally by Enter retained from prior input.

### 23.4 Native Harness tests

- real WebView2 window through `winapp ui`;
- microphone permission allow/deny;
- WebRTC audio device loss/recovery;
- runtime reconnect;
- App Server restart;
- native screenshot evidence;
- high-DPI and multiple monitor simulation where possible.

### 23.5 Windows integration tests

- window/workspace semantic controls;
- synthetic UIA fixture app covering major control patterns;
- Notepad/File Explorer/Terminal smoke tests where available;
- injected-input failure on locked/secure desktop;
- UIAccess broker deny paths;
- watchdog restoration;
- installer/update/rollback/uninstall.

### 23.6 Performance targets

Treat these as initial budgets to measure and refine, not claims:

- orb visual response to local invocation: under 100 ms;
- local interruption/cancel recognition: under 100 ms;
- shell/runtime IPC dispatch overhead: under 50 ms p95 on local machine;
- no dropped animation frames during normal capsule transitions on target hardware;
- Agent OS incremental idle CPU: target under 0.5% average;
- Agent OS incremental idle working set excluding Codex App Server: target under 150 MB;
- no unbounded webview or transcript memory growth.

---

## 24. CI pipeline

Extend Seelen's existing CI rather than removing it.

### Pull request gates

**Shell:**

- `deno fmt --check`
- `deno lint`
- `npm run type-check`
- real JavaScript unit tests
- Shell Studio interaction tests
- Shell Studio visual/ARIA snapshots on pinned Windows runner
- `cargo fmt -- --check`
- `cargo clippy --locked --all-targets -- -D warnings`
- `cargo test --locked`
- Agent OS protocol generation drift check
- Harness Mode no-side-effect test

**Runtime:**

- format/clippy/test;
- schema generation drift;
- fake App Server integration;
- replay suite;
- policy/property tests;
- Windows UIA backend tests on Windows runner;
- security lint and dependency audit.

### Nightly gates

- pinned real App Server startup/schema test;
- native Harness smoke with `winapp ui` capture;
- Windows Sandbox installer/shell smoke;
- Hyper-V integration when infrastructure is available;
- memory/long-session test;
- crash/recovery scenarios.

### Release gates

- signed binaries;
- SBOM and hashes;
- compatible shell/runtime/app-server manifest;
- update and rollback test;
- emergency recovery test;
- license notices/source-offer requirements reviewed;
- manual north-star demo recording and evidence bundle.

---

## 25. Milestone implementation plan

Do not begin a milestone until the previous milestone's acceptance criteria are met.

### M00 — Baseline, fork, and evidence

**Tasks**

- fork Seelen;
- create runtime repository;
- record exact upstream and Codex SHAs;
- build current Seelen according to upstream instructions;
- run current checks;
- document every observed live side effect of current development startup;
- add architecture and upstream tracking docs;
- create milestone branches.

**Acceptance**

- unchanged upstream baseline builds;
- no production Agent OS design changes yet;
- baseline evidence and known failures recorded;
- upstream remote configured.

### M01 — Runtime Mode and SideEffectGuard

**Tasks**

- add `RuntimeMode` parsing before production startup;
- add `ShellEffectCapability`;
- split production and harness bootstraps;
- add harness Tauri config, unique data/cache/pipe names;
- add no-op fixture adapters;
- add tests proving production-only functions cannot be reached in Harness Mode.

**Acceptance**

- Harness opens as a normal window;
- native taskbar remains unchanged;
- no Seelen service start;
- no global hooks/shortcuts/AppBar/autostart/updater;
- no production pipe or data-directory collision;
- test fails if any guarded side effect is invoked.

**Stop condition:** Do not continue if this gate is not reliable.

### M02 — Shared UI package and Shell Studio

**Tasks**

- create `libs/agent-shell-ui`;
- create Shell Studio with HMR;
- create fixture adapter, fake clock, and trace replay;
- add Playwright visual, ARIA, and interaction suites;
- add `just studio` and `just studio-test`;
- add Windows snapshot CI.

**Acceptance**

- Codex can change UI, open Studio, inspect the accessibility tree, capture screenshots, and compare snapshots without
  compiling Rust or changing Windows;
- all required base fixtures render;
- snapshot updates are explicit.

### M03 — Agent OS design system and core surfaces

**Tasks**

- implement tokens and accessibility primitives;
- implement Orb, Capsule, Sheet, Stage, Toast, and Sidecar containers;
- implement runtime state machine presentation;
- add all light/dark/contrast/reduced-motion fixtures;
- build active-monitor behavior in fixtures.

**Acceptance**

- all surfaces meet visual, keyboard, scaling, and motion tests;
- default resting state is only the small orb;
- no dashboard/sidebar is introduced;
- UI collapses cleanly after completion.

### M04 — Runtime contracts and host skeleton

**Tasks**

- create Rust workspace and `agent-contracts`;
- generate shell TypeScript types;
- implement authenticated named-pipe handshake;
- implement host lifecycle, shell reconnect, heartbeat, and snapshots;
- implement SQLite journal schema;
- implement fake runtime event source and replay.

**Acceptance**

- shell and host connect/reconnect;
- protocol incompatibility is handled visibly and safely;
- replay drives the real shell surfaces;
- no Codex dependency yet.

### M05 — Codex App Server text integration

**Tasks**

- pin or bootstrap a verified Codex binary;
- generate schemas;
- implement initialize/auth/thread/turn/event client;
- implement Coordinator/project thread registry;
- map agent messages, plan, command, file change, errors, and approvals into runtime events;
- implement app-server restart/resume.

**Acceptance**

- user enters text in the orb composer;
- a Codex turn streams into capsule/stage without a generic chat screen;
- approval request renders in the sheet;
- restart resumes the thread;
- schema drift is CI-gated.

### M06 — Voice Gate and full voice orb

**Tasks**

- complete the standalone Voice Gate spike;
- implement `VoiceBackend` and WebRTC SDP relay;
- implement WebView2 microphone permission handler;
- integrate transcript/audio/state into the orb and capsule;
- implement barge-in, mute, stop, device loss, and reconnect;
- feature-flag experimental realtime.

**Acceptance**

- natural duplex conversation works with the intended account;
- Codex can call a test MCP tool during voice;
- user can interrupt immediately;
- microphone indicator and privacy rules are enforced;
- text fallback works when realtime is unavailable.

### M07 — Desktop State Graph and semantic Seelen bridge

**Tasks**

- add Agent OS backend module following Seelen's modern module pattern;
- subscribe to relevant typed Seelen events;
- build stable entity references and revisioned graph;
- expose read-only MCP tools first;
- add semantic window/workspace/app/system actions;
- add observation and postcondition verification;
- regenerate Seelen TS bindings where commands/events change.

**Acceptance**

- Coordinator can query authoritative state without screenshots;
- it can create/switch/rename workspaces, launch/focus/arrange windows, and set reversible system state;
- stale references are rejected;
- every action is journaled and verified.

### M08 — Experience Orchestrator and adaptive surfaces

**Tasks**

- implement proposal and surface-plan schemas;
- implement deterministic presentation policy;
- map App Server item types to surfaces;
- add `experience.suggest`;
- implement focus-steal prevention and active-monitor placement;
- implement Artifact Shelf.

**Acceptance**

- invalid/arbitrary layouts are rejected;
- status stays compact;
- approvals use sheets;
- visual artifacts use the stage;
- non-visual actions stay voice-first;
- only one focal surface appears at a time.

### M09 — Image Studio and MCP App surface

**Tasks**

- map image-generation items and artifacts;
- implement image stage and actions;
- add optional backend abstraction for direct image API;
- implement restricted MCP UI resource renderer;
- add CSP/navigation/permission tests;
- add fallback structured rendering.

**Acceptance**

- voice request can generate an image and show it in Image Studio;
- user can save/copy/edit/set wallpaper through separate typed actions;
- MCP HTML cannot call Tauri or shell APIs;
- unsupported resources degrade safely.

### M10 — Windows UI Automation

**Tasks**

- implement pinned `winapp ui` backend and workflow tests;
- build synthetic UIA fixture app;
- implement native Rust UIA backend;
- add target revalidation and outcome verification;
- implement WGC target capture;
- add input fallback behind policy/feature flag.

**Acceptance**

- common controls can be inspected and operated semantically;
- input is used only when patterns fail;
- target movement/focus changes cancel input;
- actions fail safely on locked/secure desktop;
- screenshots are bounded and redacted.

### M11 — Policy hardening, undo, and approvals

**Tasks**

- complete R0–R3 policy engine;
- integrate current-intent and workflow grants;
- implement approval expiration;
- implement real undo for reversible actions;
- protect secrets with DPAPI/Credential Manager;
- combine Codex and Agent OS approvals visually without conflating them.

**Acceptance**

- high-risk actions cannot run without explicit approval;
- stale or target-changed approvals fail;
- model cannot bypass policy;
- valid reversible actions expose working Undo;
- sensitive values do not appear in traces/logs.

### M12 — Watchdog, Safe Mode, and elevated broker

**Tasks**

- implement watchdog and taskbar restoration;
- implement emergency chord and crash-loop detection;
- implement last-known-good config and Safe Mode;
- only after need is proven, implement narrow signed elevated/UIAccess broker.

**Acceptance**

- forced shell crash restores normal Windows controls;
- repeated crashes disable autostart;
- emergency chord cancels active input and restores control;
- broker has no arbitrary execution path;
- UAC/secure desktop remains user-controlled.

### M13 — Disposable integration lab and packaging

**Tasks**

- add `.wsb` configuration and scripts;
- create Hyper-V clean checkpoint workflow;
- build signed coordinated installer/update manifest;
- run install/update/rollback/uninstall;
- gather full evidence bundles.

**Acceptance**

- no daily-host installation is needed for automated shell development;
- disposable environment passes north-star workflow;
- rollback restores Windows cleanly;
- shell/runtime/app-server version compatibility is enforced.

### M14 — Canary and v1 release

**Tasks**

- enable on one canary machine;
- run extended voice and automation sessions;
- measure performance budgets;
- fix reliability and visual defects;
- complete source/license notices and release documentation.

**Acceptance**

- seven-day canary without unrecovered shell failure;
- no uncontrolled input events;
- no lost user data in test matrix;
- emergency recovery verified again;
- north-star demo passes from clean login.

---

## 26. Exact first vertical slice

The first end-to-end product slice after the safety foundation is:

> “Set me up to work on Agent OS. Open the shell repo in VS Code, open a terminal in the runtime repo, create a Research
> workspace with the relevant browser page, arrange everything cleanly, enable focus mode, and tell me when it is
> ready.”

Expected behavior:

1. Orb enters Listening.
2. Transcript appears briefly in Capsule.
3. Coordinator creates a plan.
4. Capsule shows only the current meaningful step.
5. Runtime queries desktop state.
6. Runtime creates/selects workspaces.
7. Semantic Seelen tools launch and arrange applications.
8. Focus mode is applied through a typed reversible action.
9. Each step is observed and verified.
10. Capsule says Ready and collapses.
11. Toast offers Undo arrangement.
12. User interrupts midway: “Put the browser beside VS Code instead.”
13. Current conflicting actions cancel, state refreshes, and the layout adapts.

This vertical slice must work in:

- Shell Studio replay;
- Native Harness with fake apps;
- disposable Windows integration environment with real apps;
- canary production mode.

---

## 27. Additional experience scenarios

### Generated image

> “Make a clean dark wallpaper inspired by the Agent OS orb.”

- voice remains primary;
- image-generation item opens Image Studio;
- progress is visible without fake percentages;
- final image fills the stage;
- actions: save, edit, copy, set wallpaper;
- stage closes back to orb; result remains in Artifact Shelf.

### External message

> “Draft a reply to Juan saying the deployment is complete and send it.”

- connected app/MCP drafts message;
- stage or sheet shows exact draft and recipient;
- sending is R3 external side effect;
- explicit approval immediately before send;
- completion is verified through connector response.

### Research plus coding

> “Research the current Codex realtime protocol and update our adapter.”

- Coordinator assigns a project thread;
- compact multi-agent progress appears only while needed;
- coding agent edits in workspace-write sandbox;
- result stage shows summary and diff;
- desktop orchestration remains separate from coding shell permissions.

### Contextual UI change

> “Compare these two generated images.”

- Experience Orchestrator selects a comparison stage because voice-only output is insufficient;
- two-up layout appears;
- user says “use the left one”; selection is applied;
- stage closes.

---

## 28. Required source changes in the Seelen fork

Codex must inspect exact current module registration and resource metadata paths before editing, but the intended
structure is:

```text
src/background/
  runtime_mode.rs
  safe_mode.rs
  modules/
    agent_os/
      mod.rs
      domain.rs
      application.rs
      infrastructure.rs
      ipc.rs
      surface_manager.rs
      shell_state_adapter.rs

src/ui/svelte/
  agent_orb/
  agent_capsule/
  agent_stage/
  agent_approval/
  agent_harness/

libs/
  agent-shell-ui/
  agent-runtime-client/

tools/
  shell-studio/

docs/agent-os/
  ARCHITECTURE.md
  SECURITY.md
  DEVELOPMENT.md
  UPSTREAM_INTEGRATION.md
```

When adding backend commands/events:

1. update Rust declarations in `libs/core/src/handlers/commands.rs` and/or `events.rs`;
2. use the modern Seelen application/infrastructure module pattern;
3. regenerate bindings with `cd libs/core && deno task build:rs`;
4. never manually edit generated TypeScript files.

Agent UI components belong in the shared library. Seelen widget entrypoints should remain thin adapters that initialize
the webview, bind real ports, mount, and call ready.

---

## 29. Coding-agent operating instructions

Place these rules in the project `AGENTS.md`:

1. Default UI command is `just studio`, never production `tauri dev`.
2. Never install, enable autostart, hide the taskbar, register global hooks, or run Integration/Production Mode on the
   developer's daily Windows session.
3. Do not run `cargo build --release` during ordinary iteration.
4. Run `cargo check` after Rust changes and focused tests before broad tests.
5. Every new UI state needs a fixture, visual snapshot, and ARIA snapshot.
6. Every new action needs:
   - schema;
   - fake backend;
   - risk classification;
   - policy tests;
   - before/after observation;
   - verification;
   - undo decision;
   - replay fixture.
7. Every upstream-sensitive modification must be documented in `UPSTREAM_PATCHES.md`.
8. Do not bypass Agent OS policy by calling PowerShell, Tauri shell APIs, raw Win32 input, or unrestricted Seelen
   commands.
9. Do not expose private reasoning. Surface concise plans, actions, results, and errors only.
10. Do not update visual snapshots automatically unless the task explicitly includes reviewed visual changes.
11. Stop the milestone if its safety acceptance criterion fails.
12. Commit each milestone in reviewable units; do not combine the safe harness and the full shell redesign in one
    change.

---

## 30. Definition of done for v1

V1 is done only when all statements are true:

- the shell is a maintained Seelen fork with documented upstream changes;
- ordinary UI development never changes the live Windows shell;
- Shell Studio, Native Harness, and disposable Windows test loops exist;
- Codex App Server is pinned, typed, authenticated, restartable, and resumable;
- official Codex realtime voice has passed the Voice Gate for the intended account, or the product clearly runs in text
  fallback mode;
- the orb is the only default persistent Agent OS UI;
- adaptive UI is deterministic and schema-bound;
- image generation renders in Image Studio;
- semantic window/workspace/application tools work and verify outcomes;
- UIA drives common app controls before input injection;
- policy blocks unapproved high-risk actions;
- user interruption immediately stops automation;
- action journal and real Undo work for reversible shell actions;
- watchdog restores normal Windows behavior after forced failure;
- installer, update, rollback, and uninstall pass in a clean environment;
- accessibility, visual regression, protocol, recovery, and integration tests pass;
- the north-star voice workflow succeeds from a clean login.

---

## 31. Explicit out of scope for v1

- replacing the Windows kernel or Explorer process;
- restyling the internal chrome of every arbitrary Windows application;
- automating the secure desktop, UAC prompt, lock screen, or Ctrl+Alt+Delete;
- always-listening wake word;
- autonomous purchases or financial transactions;
- unrestricted arbitrary MCP HTML with shell access;
- Windows 10 parity;
- ARM64 release parity before x64 stability;
- raw coordinate automation as a normal path;
- a persistent dashboard or traditional AI sidebar.

---

## 32. Reference material inspected

### Seelen UI

- `https://github.com/eythaann/Seelen-UI`
- `README.md`
- `AGENTS.md`
- `package.json`
- `Cargo.toml`
- `src/tauri.conf.json`
- `src/background/main.rs`
- `src/background/app.rs`
- `src/background/widgets/manager.rs`
- `src/background/widgets/loader.rs`
- `src/background/widgets/webview.rs`
- `src/background/widgets/permissions.rs`
- `libs/core/src/handlers/commands.rs`
- `libs/core/src/handlers/events.rs`
- `libs/slu-ipc/`
- `documentation/widget-js-api.md`
- `documentation/widget-guidelines.md`
- `documentation/theme-guidelines.md`
- `.github/workflows/ci.yml`

### Codex/OpenAI

- `https://openai.com/index/unlocking-the-codex-harness/`
- `https://help.openai.com/en/articles/20001275`
- `https://github.com/openai/codex`
- `codex-rs/app-server/README.md`
- `codex-rs/app-server-protocol/src/protocol/v2/realtime.rs`
- generated App Server protocol schemas
- current OpenAI image-generation model documentation

### Windows and test tooling

- Microsoft Windows UI Automation and control-pattern documentation
- Microsoft `winapp ui` documentation and repository
- Windows Graphics Capture documentation
- Windows Sandbox documentation
- WebView2 permission APIs
- Playwright visual and ARIA snapshot documentation

---

## 33. Final instruction to Codex

Begin with **M00**, then implement **M01 and M02 before touching the production shell design**. The success of this
project depends on making the shell observable, replayable, and safe to iterate before it becomes powerful.

Do not optimize for the fastest path to a pretty screenshot. Optimize for the fastest path to a system Codex can
repeatedly inspect, test, recover, and improve without risking the developer's daily Windows environment.
