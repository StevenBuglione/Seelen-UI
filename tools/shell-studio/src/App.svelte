<script lang="ts">
  import {
    FixturePreview,
    FixtureShellAdapter,
    fixtureNames,
    isFixtureName,
    parseAosTrace,
    type FixtureName,
    type InjectionKind,
    type MotionMode,
    type StudioTheme,
  } from "@agent-os/shell-ui";
  import traceText from "./replay/thinking-to-result.aostrace.jsonl?raw";

  const viewportPresets = {
    "1366×768": { width: 1366, height: 768 },
    "1920×1080": { width: 1920, height: 1080 },
    "2560×1440": { width: 2560, height: 1440 },
    "3440×1440 ultrawide": { width: 3440, height: 1440 },
  } as const;
  type ViewportName = keyof typeof viewportPresets;

  const dpiPresets = { "100%": 1, "125%": 1.25, "150%": 1.5, "200%": 2 } as const;
  type DpiName = keyof typeof dpiPresets;

  const injections: readonly { kind: InjectionKind; label: string }[] = [
    { kind: "user-speech", label: "User speech" },
    { kind: "agent-transcript", label: "Agent transcript" },
    { kind: "plan", label: "Plan" },
    { kind: "command", label: "Command" },
    { kind: "image-generation", label: "Image generation" },
    { kind: "mcp-tool", label: "MCP tool" },
    { kind: "approval", label: "Approval" },
    { kind: "error", label: "Error" },
    { kind: "cancellation", label: "Cancellation" },
    { kind: "reconnection", label: "Reconnection" },
    { kind: "multi-agent", label: "Multi-agent" },
  ];

  const parameters = new URLSearchParams(window.location.search);
  const requestedFixture = parameters.get("fixture") ?? "idle";
  const initialFixture: FixtureName = isFixtureName(requestedFixture) ? requestedFixture : "idle";
  const requestedTheme = parameters.get("theme");
  const initialTheme: StudioTheme = requestedTheme === "light" || requestedTheme === "high-contrast" ? requestedTheme : "dark";
  const initialMotion: MotionMode = parameters.get("motion") === "reduced" ? "reduced" : "normal";

  const adapter = new FixtureShellAdapter(initialFixture);
  let fixture = $state<FixtureName>(initialFixture);
  let theme = $state<StudioTheme>(initialFixture === "high-contrast" ? "high-contrast" : initialTheme);
  let motion = $state<MotionMode>(initialFixture === "reduced-motion" ? "reduced" : initialMotion);
  let viewport = $state<ViewportName>("1366×768");
  let dpi = $state<DpiName>("100%");
  let monitorCount = $state<1 | 2>(1);
  let snapshot = $state(adapter.snapshot());
  let replayStatus = $state("Trace ready");

  const viewportSize = $derived(viewportPresets[viewport]);
  const aspectRatio = $derived(`${viewportSize.width} / ${viewportSize.height}`);

  function chooseFixture(event: Event): void {
    const next = (event.currentTarget as HTMLSelectElement).value;
    if (!isFixtureName(next)) return;
    fixture = next;
    if (next === "high-contrast") theme = "high-contrast";
    if (next === "reduced-motion") motion = "reduced";
    snapshot = adapter.loadFixture(next);
  }

  function inject(kind: InjectionKind): void {
    snapshot = adapter.inject({ kind });
    fixture = snapshot.state.fixture;
  }

  function replayTrace(): void {
    const envelopes = parseAosTrace(traceText);
    snapshot = adapter.replay(envelopes);
    fixture = snapshot.state.fixture;
    replayStatus = `Replayed ${envelopes.length} events through sequence ${envelopes.at(-1)?.seq ?? 0}`;
  }
</script>

<svelte:head>
  <meta name="description" content="Browser-only deterministic Agent OS Shell Studio" />
</svelte:head>

<div class="studio" data-studio-ready="true">
  <header class="studio-header">
    <div>
      <p class="product-kicker">Agent OS · Level A</p>
      <h1>Shell Studio</h1>
    </div>
    <div class="safety-badge" role="status">
      <span aria-hidden="true"></span>
      Browser fixtures only · no native bridge
    </div>
  </header>

  <main>
    <aside class="control-panel" aria-label="Studio controls">
      <section aria-labelledby="scenario-controls">
        <h2 id="scenario-controls">Scenario</h2>
        <label>
          Fixture
          <select aria-label="Fixture" value={fixture} onchange={chooseFixture}>
            {#each fixtureNames as name}<option value={name}>{name}</option>{/each}
          </select>
        </label>
        <label>
          Viewport
          <select aria-label="Viewport" bind:value={viewport}>
            {#each Object.keys(viewportPresets) as name}<option value={name}>{name}</option>{/each}
          </select>
        </label>
        <label>
          CSS scale / DPI
          <select aria-label="CSS scale / DPI" bind:value={dpi}>
            {#each Object.keys(dpiPresets) as name}<option value={name}>{name}</option>{/each}
          </select>
        </label>
        <label>
          Theme
          <select aria-label="Theme" bind:value={theme}>
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="high-contrast">high-contrast</option>
          </select>
        </label>
        <label>
          Motion
          <select aria-label="Motion" bind:value={motion}>
            <option value="normal">normal</option>
            <option value="reduced">reduced</option>
          </select>
        </label>
        <label>
          Monitor canvas
          <select aria-label="Monitor canvas" bind:value={monitorCount}>
            <option value={1}>one monitor</option>
            <option value={2}>two monitors</option>
          </select>
        </label>
      </section>

      <section aria-labelledby="injection-controls">
        <h2 id="injection-controls">Inject event</h2>
        <div class="button-grid">
          {#each injections as injection}
            <button type="button" onclick={() => inject(injection.kind)}>{injection.label}</button>
          {/each}
        </div>
      </section>

      <section aria-labelledby="replay-controls">
        <h2 id="replay-controls">Trace replay</h2>
        <p>{replayStatus}</p>
        <button type="button" onclick={replayTrace}>Replay thinking-to-result.aostrace</button>
      </section>
    </aside>

    <section class="workbench" aria-labelledby="preview-heading">
      <header class="workbench-heading">
        <div>
          <p>Fixture {fixtureNames.indexOf(fixture) + 1} of {fixtureNames.length}</p>
          <h2 id="preview-heading">{snapshot.state.heading}</h2>
        </div>
        <dl>
          <div><dt>Viewport</dt><dd>{viewport}</dd></div>
          <div><dt>DPI</dt><dd>{dpi}</dd></div>
          <div><dt>Clock</dt><dd data-testid="clock-value">{snapshot.clockMs}</dd></div>
        </dl>
      </header>

      <div
        class="viewport-frame"
        data-testid="viewport-frame"
        data-viewport={`${viewportSize.width}x${viewportSize.height}`}
        style={`--viewport-ratio: ${aspectRatio}`}
      >
        <FixturePreview
          {snapshot}
          {theme}
          {motion}
          {monitorCount}
          dpiScale={dpiPresets[dpi]}
        />
      </div>

      <button class="clock-button" type="button" onclick={() => (snapshot = adapter.advanceClock(1_000))}>
        Advance fake clock by 1 second
      </button>

      <div class="inspectors">
        <details open>
          <summary>AgentRuntimeState</summary>
          <pre data-testid="runtime-state">{JSON.stringify(snapshot.state, null, 2)}</pre>
        </details>
        <details open>
          <summary>SurfacePlan</summary>
          <pre data-testid="surface-plan">{JSON.stringify(snapshot.plan, null, 2)}</pre>
        </details>
        <details>
          <summary>Determinism</summary>
          <pre>{JSON.stringify({
            clockMs: snapshot.clockMs,
            deterministicId: snapshot.deterministicId,
            randomValue: snapshot.randomValue,
            networkLatencyMs: snapshot.networkLatencyMs,
          }, null, 2)}</pre>
        </details>
      </div>
    </section>
  </main>
</div>
