<script lang="ts">
  import "../design-system/tokens.css";
  import type { FixtureSnapshot, MotionMode, StudioTheme } from "../state/types.ts";
  import ActivityCapsule from "./ActivityCapsule.svelte";
  import AgentSidecar from "./AgentSidecar.svelte";
  import AgentToast from "./AgentToast.svelte";
  import ApprovalSheet from "./ApprovalSheet.svelte";
  import ResultStage from "./ResultStage.svelte";

  interface Props {
    snapshot: FixtureSnapshot;
    theme?: StudioTheme;
    motion?: MotionMode;
    dpiScale?: number;
    onClose?: () => void;
  }

  let { snapshot, theme = "dark", motion = "normal", dpiScale = 1, onClose = () => {} }: Props = $props();
  let dismissedSurfaceIds = $state<string[]>([]);
  let renderedRevision = $state(0);

  $effect(() => {
    if (snapshot.plan.revision !== renderedRevision) {
      renderedRevision = snapshot.plan.revision;
      dismissedSurfaceIds = [];
    }
  });

  const visibleSurfaces = $derived(
    snapshot.plan.surfaces.filter((surface) => surface.kind !== "orb" && !dismissedSurfaceIds.includes(surface.id)),
  );
  const showInvocationCapsule = $derived(visibleSurfaces.length === 0 && snapshot.state.presentation === "rest");
  const hasSheet = $derived(visibleSurfaces.some((surface) => surface.kind === "sheet"));

  function dismiss(surfaceId: string): void {
    if (!dismissedSurfaceIds.includes(surfaceId)) {
      dismissedSurfaceIds = [...dismissedSurfaceIds, surfaceId];
    }
    onClose();
  }
</script>

<div
  id="agent-os-surface-layer"
  class="agent-surface-layer aos-design-system"
  data-testid="agent-surface-layer"
  data-aos-theme={theme}
  data-aos-motion={motion}
  data-surface-count={visibleSurfaces.length + (showInvocationCapsule ? 1 : 0)}
  data-runtime-phase={snapshot.state.phase}
  style={`--aos-dpi:${dpiScale}`}
  aria-label="Agent OS surface layer"
>
  {#if hasSheet}<div class="decision-scrim" aria-hidden="true"></div>{/if}

  {#if showInvocationCapsule}
    <div class="surface-placement capsule-placement">
      <ActivityCapsule state={{ ...snapshot.state, heading: "What should we work on?", message: "Type a request. Voice stays off until you start it.", composerOpen: true }} onCancel={onClose} />
    </div>
  {/if}

  {#each visibleSurfaces as surface (surface.id)}
    {#if surface.kind === "capsule"}
      <div class="surface-placement capsule-placement"><ActivityCapsule state={snapshot.state} onCancel={() => dismiss(surface.id)} /></div>
    {:else if surface.kind === "sheet"}
      <div class="surface-placement sheet-placement"><ApprovalSheet state={snapshot.state} onDeny={() => dismiss(surface.id)} onApprove={() => dismiss(surface.id)} /></div>
    {:else if surface.kind === "stage"}
      <div class="surface-placement stage-placement"><ResultStage state={snapshot.state} onDismiss={() => dismiss(surface.id)} /></div>
    {:else if surface.kind === "toast"}
      <div class="surface-placement toast-placement"><AgentToast state={snapshot.state} onDismiss={() => dismiss(surface.id)} /></div>
    {:else if surface.kind === "sidecar"}
      <div class="surface-placement sidecar-placement"><AgentSidecar state={snapshot.state} onDismiss={() => dismiss(surface.id)} /></div>
    {/if}
  {/each}
</div>

<style>
  .agent-surface-layer {
    position: absolute;
    z-index: 60;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .decision-scrim {
    position: absolute;
    z-index: 0;
    inset: 0;
    background: rgba(0, 0, 0, 0.34);
    backdrop-filter: blur(0.1538em);
    pointer-events: auto;
    animation: scrim-enter var(--aos-duration-appear) ease-out both;
  }

  .surface-placement {
    position: absolute;
    z-index: 1;
    pointer-events: auto;
  }

  .capsule-placement {
    top: 2.1538em;
    right: 0.6154em;
    left: 0.6154em;
    display: flex;
    justify-content: flex-end;
  }

  .sheet-placement {
    inset: 2.1538em 1.2308em 1.2308em;
    display: grid;
    place-items: center;
  }

  .stage-placement {
    inset: 2.7692em 2em 1.2308em;
    display: grid;
    place-items: center;
  }

  .toast-placement {
    top: 2.1538em;
    right: 0.6154em;
    left: 0.6154em;
    display: flex;
    justify-content: flex-end;
  }

  .sidecar-placement {
    top: 2.7692em;
    right: 0.6154em;
    bottom: 0.6154em;
    left: 1.2308em;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  @keyframes scrim-enter {
    from { opacity: 0; }
  }

  @media (max-width: 760px) {
    .stage-placement {
      inset: 1em 1em 4.7692em;
    }

    .sidecar-placement {
      top: auto;
      right: 1em;
      bottom: 4.7692em;
      left: 1em;
    }
  }
</style>
