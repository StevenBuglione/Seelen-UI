<script lang="ts">
  import {
    FixturePreview,
    FixtureShellAdapter,
    ShellExperience,
    fixtureNames,
    isFixtureName,
    isOmarchyThemeId,
    omarchyThemes,
    parseAosTrace,
    type FixtureName,
    type InjectionKind,
    type MotionMode,
    type OmarchyThemeId,
    type ShellLayout,
    type ShellPanel,
    type ShellWorkspaceId,
    type StudioTheme,
  } from "@agent-os/shell-ui";
  import traceText from "./replay/thinking-to-result.aostrace.jsonl?raw";

  type StudioMode = "shell" | "fixtures";

  const viewportPresets = {
    "1366×768": { width: 1366, height: 768 },
    "1920×1080": { width: 1920, height: 1080 },
    "2560×1440": { width: 2560, height: 1440 },
    "3440×1440 ultrawide": { width: 3440, height: 1440 },
  } as const;
  type ViewportName = keyof typeof viewportPresets;

  const dpiPresets = { "100%": 1, "125%": 1.25, "150%": 1.5, "200%": 2 } as const;
  type DpiName = keyof typeof dpiPresets;

  const shellPanels: readonly { value: ShellPanel; label: string }[] = [
    { value: "none", label: "Desktop" },
    { value: "launcher", label: "Application launcher" },
    { value: "calendar", label: "Calendar and agenda" },
    { value: "quick-settings", label: "Quick settings" },
    { value: "notifications", label: "Notifications" },
    { value: "overview", label: "Workspace overview" },
  ];

  const shellLayouts: readonly ShellLayout[] = ["dwindle", "master", "columns", "monocle"];

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
  const initialMode: StudioMode = parameters.get("mode") === "fixtures" ? "fixtures" : "shell";
  const requestedFixture = parameters.get("fixture") ?? "idle";
  const initialFixture: FixtureName = isFixtureName(requestedFixture) ? requestedFixture : "idle";
  const requestedTheme = parameters.get("theme");
  const initialTheme: StudioTheme = requestedTheme === "light" || requestedTheme === "high-contrast" ? requestedTheme : "dark";
  const requestedShellTheme = parameters.get("shellTheme") ?? "vantablack";
  const initialShellTheme: OmarchyThemeId = isOmarchyThemeId(requestedShellTheme) ? requestedShellTheme : "vantablack";
  const requestedPanel = parameters.get("panel") ?? "none";
  const initialPanel: ShellPanel = shellPanels.some((entry) => entry.value === requestedPanel) ? requestedPanel as ShellPanel : "none";
  const requestedLayout = parameters.get("layout") ?? "dwindle";
  const initialLayout: ShellLayout = shellLayouts.includes(requestedLayout as ShellLayout) ? requestedLayout as ShellLayout : "dwindle";
  const requestedWorkspace = Number(parameters.get("workspace") ?? 1);
  const initialWorkspace: ShellWorkspaceId = requestedWorkspace >= 1 && requestedWorkspace <= 5 ? requestedWorkspace as ShellWorkspaceId : 1;
  const initialMotion: MotionMode = parameters.get("motion") === "reduced" ? "reduced" : "normal";

  const adapter = new FixtureShellAdapter(initialFixture);
  let mode = $state<StudioMode>(initialMode);
  let fixture = $state<FixtureName>(initialFixture);
  let theme = $state<StudioTheme>(initialFixture === "high-contrast" ? "high-contrast" : initialTheme);
  let shellTheme = $state<OmarchyThemeId>(initialShellTheme);
  let shellPanel = $state<ShellPanel>(initialPanel);
  let shellLayout = $state<ShellLayout>(initialLayout);
  let shellWorkspace = $state<ShellWorkspaceId>(initialWorkspace);
  let motion = $state<MotionMode>(initialFixture === "reduced-motion" ? "reduced" : initialMotion);
  let viewport = $state<ViewportName>("1366×768");
  let dpi = $state<DpiName>("100%");
  let monitorCount = $state<1 | 2>(1);
  let snapshot = $state(adapter.snapshot());
  let replayStatus = $state("Trace ready");

  const viewportSize = $derived(viewportPresets[viewport]);
  const aspectRatio = $derived(`${viewportSize.width} / ${viewportSize.height}`);
  const currentShellTheme = $derived(omarchyThemes.find((candidate) => candidate.id === shellTheme)!);

  function chooseMode(event: Event): void {
    mode = (event.currentTarget as HTMLSelectElement).value as StudioMode;
  }

  function chooseFixture(event: Event): void {
    const next = (event.currentTarget as HTMLSelectElement).value;
    if (!isFixtureName(next)) return;
    fixture = next;
    if (next === "high-contrast") theme = "high-contrast";
    if (next === "reduced-motion") motion = "reduced";
    snapshot = adapter.loadFixture(next);
  }

  function chooseShellTheme(event: Event): void {
    const next = (event.currentTarget as HTMLSelectElement).value;
    if (isOmarchyThemeId(next)) shellTheme = next;
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

<div class="studio" data-studio-ready="true" data-studio-mode={mode}>
  <header class="studio-header">
    <div class="studio-identity">
      <span class="studio-mark" aria-hidden="true"></span>
      <div><p class="product-kicker">Agent OS · Safe design lab</p><h1>Shell Studio</h1></div>
    </div>
    <div class="header-meta">
      <span>Omarchy source · quattro · 83881e9</span>
      <div class="safety-badge" role="status"><span aria-hidden="true"></span>Browser fixtures only · no native bridge</div>
    </div>
  </header>

  <main>
    <aside class="control-panel" aria-label="Studio controls">
      <section aria-labelledby="experience-controls">
        <h2 id="experience-controls">Experience</h2>
        <label>Preview<select aria-label="Preview" value={mode} onchange={chooseMode}><option value="shell">Omarchy shell baseline</option><option value="fixtures">Agent fixtures · deferred</option></select></label>
        <label>Viewport<select aria-label="Viewport" bind:value={viewport}>{#each Object.keys(viewportPresets) as name}<option value={name}>{name}</option>{/each}</select></label>
        <label>CSS scale / DPI<select aria-label="CSS scale / DPI" bind:value={dpi}>{#each Object.keys(dpiPresets) as name}<option value={name}>{name}</option>{/each}</select></label>
        <label>Motion<select aria-label="Motion" bind:value={motion}><option value="normal">normal</option><option value="reduced">reduced</option></select></label>
        <label>Monitor canvas<select aria-label="Monitor canvas" bind:value={monitorCount}><option value={1}>one monitor</option><option value={2}>two monitors</option></select></label>
      </section>

      {#if mode === "shell"}
        <section aria-labelledby="shell-controls">
          <h2 id="shell-controls">Shell contract</h2>
          <label>Omarchy theme<select aria-label="Omarchy theme" value={shellTheme} onchange={chooseShellTheme}>{#each omarchyThemes as candidate}<option value={candidate.id}>{candidate.label}</option>{/each}</select></label>
          <label>Workspace<select aria-label="Workspace" bind:value={shellWorkspace}><option value={1}>1 · Build</option><option value={2}>2 · Research</option><option value={3}>3 · Design</option><option value={4}>4 · Media</option><option value={5}>5 · Focus</option></select></label>
          <label>Window layout<select aria-label="Window layout" bind:value={shellLayout}>{#each shellLayouts as layoutName}<option value={layoutName}>{layoutName}</option>{/each}</select></label>
          <label>Contextual panel<select aria-label="Contextual panel" bind:value={shellPanel}>{#each shellPanels as entry}<option value={entry.value}>{entry.label}</option>{/each}</select></label>
          <div class="shell-state-buttons" aria-label="Shell state shortcuts">
            {#each shellPanels.slice(1) as entry}
              <button type="button" aria-pressed={shellPanel === entry.value} onclick={() => (shellPanel = shellPanel === entry.value ? "none" : entry.value)}>{entry.label}</button>
            {/each}
          </div>
        </section>
      {:else}
        <section aria-labelledby="scenario-controls">
          <h2 id="scenario-controls">Deferred agent fixtures</h2>
          <label>Fixture<select aria-label="Fixture" value={fixture} onchange={chooseFixture}>{#each fixtureNames as name}<option value={name}>{name}</option>{/each}</select></label>
          <label>Fixture theme<select aria-label="Theme" bind:value={theme}><option value="light">light</option><option value="dark">dark</option><option value="high-contrast">high-contrast</option></select></label>
        </section>
        <section aria-labelledby="injection-controls"><h2 id="injection-controls">Inject event</h2><div class="button-grid">{#each injections as injection}<button type="button" onclick={() => inject(injection.kind)}>{injection.label}</button>{/each}</div></section>
        <section aria-labelledby="replay-controls"><h2 id="replay-controls">Trace replay</h2><p>{replayStatus}</p><button type="button" onclick={replayTrace}>Replay thinking-to-result.aostrace</button></section>
      {/if}
    </aside>

    <section class="workbench" aria-labelledby="preview-heading">
      <header class="workbench-heading">
        <div><p>{mode === "shell" ? "Shell-first visual baseline" : `Fixture ${fixtureNames.indexOf(fixture) + 1} of ${fixtureNames.length}`}</p><h2 id="preview-heading">{mode === "shell" ? `${currentShellTheme.label} · ${shellPanel === "none" ? "Desktop" : shellPanels.find((entry) => entry.value === shellPanel)?.label}` : snapshot.state.heading}</h2></div>
        <dl><div><dt>Viewport</dt><dd>{viewport}</dd></div><div><dt>DPI</dt><dd>{dpi}</dd></div><div><dt>Mode</dt><dd>{mode}</dd></div>{#if mode === "fixtures"}<div><dt>Clock</dt><dd data-testid="clock-value">{snapshot.clockMs}</dd></div>{/if}</dl>
      </header>

      <div class="viewport-frame" data-testid="viewport-frame" data-viewport={`${viewportSize.width}x${viewportSize.height}`} style={`--viewport-ratio:${aspectRatio};--studio-dpi:${dpiPresets[dpi]}`}>
        {#if mode === "shell"}
          <ShellExperience themeId={shellTheme} {motion} {monitorCount} panel={shellPanel} layout={shellLayout} workspace={shellWorkspace} onPanelChange={(next) => (shellPanel = next)} onLayoutChange={(next) => (shellLayout = next)} onWorkspaceChange={(next) => (shellWorkspace = next)} />
        {:else}
          <FixturePreview {snapshot} {theme} {motion} {monitorCount} dpiScale={dpiPresets[dpi]} />
        {/if}
      </div>

      {#if mode === "fixtures"}<button class="fixture-clock-button" type="button" onclick={() => (snapshot = adapter.advanceClock(1_000))}>Advance fake clock by 1 second</button>{/if}

      <div class="inspectors">
        {#if mode === "shell"}
          <details open><summary>ShellExperienceState</summary><pre data-testid="shell-state">{JSON.stringify({ theme: shellTheme, workspace: shellWorkspace, layout: shellLayout, panel: shellPanel, motion, monitors: monitorCount }, null, 2)}</pre></details>
          <details open><summary>OmarchySourceContract</summary><pre>{JSON.stringify({ repository: "basecamp/omarchy", branch: "quattro", revision: "83881e979b35468c3e7d60b171e319ede61a88fd", palette: `themes/${shellTheme}/colors.toml`, executableConfigImported: false }, null, 2)}</pre></details>
          <details><summary>Compatibility boundary</summary><pre>{JSON.stringify({ renderer: "Svelte / Seelen webview", desktopModel: "Seelen workspaces and WM layouts", imported: ["declarative palette", "bar grammar", "panel geometry", "wallpaper asset"], excluded: ["Quickshell QML", "Hyprland Lua", "Wayland IPC", "system services"] }, null, 2)}</pre></details>
        {:else}
          <details open><summary>AgentRuntimeState</summary><pre data-testid="runtime-state">{JSON.stringify(snapshot.state, null, 2)}</pre></details>
          <details open><summary>SurfacePlan</summary><pre data-testid="surface-plan">{JSON.stringify(snapshot.plan, null, 2)}</pre></details>
          <details><summary>Determinism</summary><pre>{JSON.stringify({ clockMs: snapshot.clockMs, deterministicId: snapshot.deterministicId, randomValue: snapshot.randomValue, networkLatencyMs: snapshot.networkLatencyMs }, null, 2)}</pre></details>
        {/if}
      </div>
    </section>
  </main>
</div>
