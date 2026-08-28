<script lang="ts">
  import AosButton from "../components/AosButton.svelte";
  import OmarchyIcon from "../components/OmarchyIcon.svelte";
  import type { FixtureState } from "../state/types.ts";

  let { state, onDismiss = () => {} }: { state: FixtureState; onDismiss?: () => void } = $props();
</script>

<section class="agent-toast" data-testid="surface-toast" role="status" aria-label={state.heading}>
  <span class="toast-symbol" aria-hidden="true"><OmarchyIcon name={state.approval?.denied ? "shield" : "check"} size={14} /></span>
  <div><strong>{state.heading}</strong><span>{state.message}</span></div>
  {#if state.completion?.undoLabel}<AosButton variant="quiet">{state.completion.undoLabel}</AosButton>{/if}
  <AosButton variant="quiet" label="Dismiss notification" onclick={onDismiss}><OmarchyIcon name="close" size={12} /></AosButton>
</section>

<style>
  .agent-toast {
    display: grid;
    width: min(30em, 100%);
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    align-items: center;
    gap: var(--aos-space-2);
    padding: var(--aos-space-2);
    border: 1px solid var(--aos-keyline);
    border-radius: var(--aos-radius-3);
    background: var(--aos-bg);
    box-shadow: var(--aos-shadow-small);
    backdrop-filter: blur(1.2308em);
    animation: toast-enter var(--aos-duration-appear) var(--aos-ease-out) both;
  }

  .toast-symbol {
    display: grid;
    width: 2em;
    height: 2em;
    place-items: center;
    border: 1px solid var(--aos-keyline);
    border-radius: 50%;
  }

  .agent-toast > div {
    display: grid;
    min-width: 0;
  }

  strong {
    font-size: var(--aos-font-body);
  }

  .agent-toast > div span {
    overflow: hidden;
    color: var(--aos-text-muted);
    font-size: var(--aos-font-caption);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @keyframes toast-enter {
    from {
      opacity: 0;
      transform: translateY(0.6154em);
    }
  }

  :global(.aos-design-system[data-aos-motion="reduced"]) .agent-toast {
    animation-name: fade-only;
  }

  @keyframes fade-only { from { opacity: 0; } }
</style>
