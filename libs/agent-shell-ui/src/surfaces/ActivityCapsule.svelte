<script lang="ts">
  import AosButton from "../components/AosButton.svelte";
  import AosProgress from "../components/AosProgress.svelte";
  import OmarchyIcon from "../components/OmarchyIcon.svelte";
  import type { FixtureState } from "../state/types.ts";

  interface Props {
    state: FixtureState;
    onCancel?: () => void;
    onSubmit?: (text: string) => void;
  }

  let { state: runtimeState, onCancel = () => {}, onSubmit = () => {} }: Props = $props();
  let composerText = $state("");

  function submitComposer(event: SubmitEvent): void {
    event.preventDefault();
    const text = composerText.trim();
    if (!text) return;
    onSubmit(text);
    composerText = "";
  }
</script>

<section class="activity-capsule" data-testid="surface-capsule" aria-labelledby="capsule-heading" aria-live="polite">
  <span class="phase-mark" data-phase={runtimeState.phase} aria-hidden="true"></span>
  <div class="capsule-copy">
    <strong id="capsule-heading">{runtimeState.heading}</strong>
    <span>{runtimeState.transcript ?? runtimeState.message}</span>
  </div>

  {#if runtimeState.progress !== undefined}
    <AosProgress value={runtimeState.progress} label="Current progress" />
  {/if}

  {#if runtimeState.composerOpen}
    <form aria-label="Agent OS text composer" onsubmit={submitComposer}>
      <input bind:value={composerText} aria-label="Message Agent OS" placeholder="Ask Agent OS" autocomplete="off" />
      <AosButton type="submit" variant="primary" label="Send message"><OmarchyIcon name="arrowRight" size={13} /></AosButton>
    </form>
  {:else}
    <div class="capsule-actions">
      <AosButton variant="quiet" label="Pause current work"><OmarchyIcon name="minimize" size={12} /> Pause</AosButton>
      <AosButton variant="quiet" label="Stop current work" onclick={onCancel}><OmarchyIcon name="close" size={12} /> Stop</AosButton>
    </div>
  {/if}

  {#if runtimeState.steps}
    <details>
      <summary>Show task details</summary>
      <ol>{#each runtimeState.steps as step}<li>{step}</li>{/each}</ol>
    </details>
  {/if}
</section>

<style>
  .activity-capsule {
    display: grid;
    width: min(38em, 100%);
    min-height: 4em;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--aos-space-3);
    padding: var(--aos-space-2) var(--aos-space-3);
    border: 1px solid var(--aos-keyline);
    border-radius: var(--aos-radius-4);
    background: var(--aos-bg);
    box-shadow: var(--aos-shadow-small);
    backdrop-filter: blur(1.2308em) saturate(1.05);
    animation: capsule-enter var(--aos-duration-expand) var(--aos-ease-out) both;
  }

  .phase-mark {
    width: 0.6154em;
    height: 0.6154em;
    border: 1px solid currentColor;
    border-radius: 50%;
  }

  .phase-mark[data-phase="acting"],
  .phase-mark[data-phase="thinking"],
  .phase-mark[data-phase="planning"] {
    border-radius: 0.1538em;
  }

  .phase-mark[data-phase="error"],
  .phase-mark[data-phase="offline"] {
    color: var(--aos-danger);
  }

  .capsule-copy {
    display: grid;
    min-width: 0;
    gap: 0.0769em;
  }

  .capsule-copy strong {
    font-size: var(--aos-font-emphasis);
    font-weight: 620;
  }

  .capsule-copy span {
    overflow: hidden;
    color: var(--aos-text-muted);
    font-size: var(--aos-font-body);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .capsule-actions,
  form {
    display: flex;
    align-items: center;
    gap: var(--aos-space-1);
  }

  form {
    grid-column: 1 / -1;
  }

  input {
    min-width: 0;
    min-height: 2.3077em;
    flex: 1;
    padding: 0 var(--aos-space-3);
    border: 1px solid var(--aos-keyline);
    border-radius: var(--aos-radius-2);
    color: var(--aos-text);
    background: var(--aos-bg-muted);
    font: inherit;
  }

  input:focus-visible,
  summary:focus-visible {
    outline: 2px solid var(--aos-focus);
    outline-offset: 2px;
  }

  :global(.activity-capsule > label),
  details {
    grid-column: 1 / -1;
  }

  details {
    color: var(--aos-text-muted);
    font-size: var(--aos-font-caption);
  }

  summary {
    width: max-content;
    cursor: pointer;
  }

  ol {
    margin: var(--aos-space-2) 0 0;
    padding-left: var(--aos-space-6);
  }

  @keyframes capsule-enter {
    from {
      opacity: 0;
      transform: translateY(0.6154em);
    }
  }

  :global(.aos-design-system[data-aos-motion="reduced"]) .activity-capsule {
    animation-name: fade-only;
  }

  @keyframes fade-only {
    from {
      opacity: 0;
    }
  }

  @media (max-width: 760px) {
    .activity-capsule {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .capsule-actions {
      grid-column: 1 / -1;
      justify-content: flex-end;
    }
  }
</style>
