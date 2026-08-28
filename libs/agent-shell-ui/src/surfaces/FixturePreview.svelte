<script lang="ts">
  import { tick } from "svelte";
  import { agentThemeShellTheme } from "../design-system/tokens.ts";
  import type { FixtureSnapshot, MotionMode, StudioTheme } from "../state/types.ts";
  import AgentOrb from "./AgentOrb.svelte";
  import AgentSurfaceLayer from "./AgentSurfaceLayer.svelte";
  import ShellExperience from "./ShellExperience.svelte";

  interface Props {
    snapshot: FixtureSnapshot;
    theme?: StudioTheme;
    motion?: MotionMode;
    monitorCount?: 1 | 2;
    dpiScale?: number;
  }

  let {
    snapshot,
    theme = "dark",
    motion = "normal",
    monitorCount = 1,
    dpiScale = 1,
  }: Props = $props();

  const activeMonitor = $derived(snapshot.plan.activeMonitor === "monitor:2" ? 2 : 1);
  const shellTheme = $derived(agentThemeShellTheme[theme]);
  let agentOpen = $state(false);
  let agentControlHost = $state<HTMLSpanElement>();
  const plannedDetailCount = $derived(snapshot.plan.surfaces.filter((surface) => surface.kind !== "orb").length);
  const renderedSurfaceCount = $derived(agentOpen ? Math.max(1, plannedDetailCount) : 0);

  async function closeAgent(): Promise<void> {
    agentOpen = false;
    await tick();
    agentControlHost?.querySelector("button")?.focus();
  }

  function toggleAgent(): void {
    if (agentOpen) {
      void closeAgent();
    } else {
      agentOpen = true;
    }
  }

  function handleAgentHotkey(event: KeyboardEvent): void {
    if (event.ctrlKey && event.shiftKey && event.code === "Space") {
      event.preventDefault();
      toggleAgent();
    }
  }
</script>

<svelte:window onkeydown={handleAgentHotkey} />

{#snippet agentControl(monitorIndex: number)}
  {#if monitorIndex === activeMonitor - 1}
    <span bind:this={agentControlHost} class="agent-control aos-design-system" data-aos-theme={theme} data-aos-motion={motion} style={`--aos-dpi:${dpiScale}`}>
      <AgentOrb state={snapshot.state} expanded={agentOpen} onInvoke={toggleAgent} />
    </span>
  {/if}
{/snippet}

{#snippet agentOverlay(monitorIndex: number)}
  {#if monitorIndex === activeMonitor - 1 && agentOpen}
    <AgentSurfaceLayer {snapshot} {theme} {motion} {dpiScale} onClose={closeAgent} />
  {/if}
{/snippet}

<section
  class="fixture-preview"
  data-testid="preview-canvas"
  data-fixture={snapshot.state.fixture}
  data-phase={snapshot.state.phase}
  data-theme={theme}
  data-motion={motion}
  data-active-monitor={snapshot.plan.activeMonitor}
  data-surface-count={renderedSurfaceCount}
  data-agent-open={agentOpen}
  aria-label={`Agent OS ${snapshot.state.fixture} fixture preview`}
>
  <ShellExperience
    themeId={shellTheme}
    {motion}
    {monitorCount}
    {activeMonitor}
    {agentControl}
    {agentOverlay}
  />
</section>

<style>
  .fixture-preview {
    width: 100%;
  }

  .agent-control {
    display: inline-flex;
    align-items: center;
    font-size: calc(13px * var(--aos-dpi, 1));
  }
</style>
