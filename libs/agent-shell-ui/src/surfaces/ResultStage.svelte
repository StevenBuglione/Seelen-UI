<script lang="ts">
  import AosButton from "../components/AosButton.svelte";
  import AosProgress from "../components/AosProgress.svelte";
  import OmarchyIcon from "../components/OmarchyIcon.svelte";
  import type { FixtureState } from "../state/types.ts";

  interface Props {
    state: FixtureState;
    onDismiss?: () => void;
  }

  let { state, onDismiss = () => {} }: Props = $props();
  const headingId = $derived(`stage-heading-${state.fixture}`);
</script>

<section class="result-stage" data-testid="surface-stage" aria-labelledby={headingId}>
  <header>
    <div><p>{state.status}</p><h2 id={headingId}>{state.heading}</h2></div>
    <AosButton variant="quiet" label="Close result stage" onclick={onDismiss}><OmarchyIcon name="close" size={14} /></AosButton>
  </header>
  <p class="stage-message">{state.message}</p>

  {#if state.progress !== undefined}<AosProgress value={state.progress} label="Task progress" />{/if}

  {#if state.artifact}
    <figure data-kind={state.artifact.kind}>
      <div class="artifact-preview" aria-label={`${state.artifact.kind} preview`}>
        {#if state.artifact.kind === "image"}
          <span class="image-plane one"></span><span class="image-plane two"></span><span class="image-sun"></span>
        {:else if state.artifact.kind === "mcp-app"}
          <span class="app-chrome"></span><span class="app-row"></span><span class="app-row short"></span>
        {:else}
          <span class="workspace-window primary"></span><span class="workspace-window secondary"></span>
        {/if}
      </div>
      <figcaption><span>{state.artifact.label}</span><small>Local fixture · provenance available</small></figcaption>
    </figure>
  {/if}

  {#if state.steps}
    <ol class="stage-steps">
      {#each state.steps as step, index}<li class:current={index === 1}><span>{index + 1}</span>{step}</li>{/each}
    </ol>
  {/if}

  {#if state.agents}
    <ul class="agent-list" aria-label="Agent progress">
      {#each state.agents as agent}<li><span class="agent-state" aria-hidden="true"></span><strong>{agent.name}</strong><span>{agent.status}</span></li>{/each}
    </ul>
  {/if}

  {#if !state.artifact && !state.steps && !state.agents}
    <div class="diagnostic-summary"><OmarchyIcon name="shield" size={20} /><p><strong>Safe state preserved</strong><span>No Windows state was changed. Diagnostic details are available on request.</span></p></div>
  {/if}

  <footer><span>Reasoning remains hidden</span><AosButton variant="secondary">Open full review</AosButton></footer>
</section>

<style>
  .result-stage {
    width: min(52em, 100%);
    max-height: 100%;
    overflow: auto;
    padding: var(--aos-space-4);
    border: 1px solid var(--aos-keyline-strong);
    border-radius: var(--aos-radius-4);
    background: var(--aos-bg-solid);
    box-shadow: var(--aos-shadow-large);
    animation: stage-enter var(--aos-duration-appear) var(--aos-ease-out) both;
  }

  header,
  footer,
  figcaption,
  .agent-list li,
  .diagnostic-summary {
    display: flex;
    align-items: center;
  }

  header,
  footer,
  figcaption {
    justify-content: space-between;
  }

  h2,
  p,
  figure {
    margin: 0;
  }

  header p,
  .stage-message,
  figcaption small,
  footer,
  .diagnostic-summary span {
    color: var(--aos-text-muted);
  }

  header p,
  figcaption,
  footer {
    font-size: var(--aos-font-caption);
  }

  h2 {
    margin-top: 0.0769em;
    font-size: var(--aos-font-display);
    font-weight: 620;
  }

  .stage-message {
    margin-top: var(--aos-space-2);
    font-size: var(--aos-font-body);
  }

  :global(.result-stage > label) {
    margin-top: var(--aos-space-4);
  }

  figure,
  .diagnostic-summary {
    margin-top: var(--aos-space-4);
    padding: var(--aos-space-3);
    border: 1px solid var(--aos-keyline);
    border-radius: var(--aos-radius-3);
    background: var(--aos-bg-muted);
  }

  .artifact-preview {
    position: relative;
    min-height: 15em;
    overflow: hidden;
    border: 1px solid var(--aos-keyline);
    border-radius: var(--aos-radius-2);
    background: color-mix(in srgb, var(--aos-bg-solid) 90%, var(--aos-accent));
  }

  .image-plane,
  .image-sun,
  .app-chrome,
  .app-row,
  .workspace-window {
    position: absolute;
    display: block;
    border: 1px solid var(--aos-keyline-strong);
  }

  .image-plane {
    right: -8%;
    bottom: -45%;
    left: -8%;
    height: 72%;
    border-radius: 50% 50% 0 0;
    background: color-mix(in srgb, var(--aos-text) 7%, transparent);
    transform: rotate(-4deg);
  }

  .image-plane.two {
    right: 24%;
    bottom: -48%;
    left: -18%;
    height: 64%;
    transform: rotate(7deg);
  }

  .image-sun {
    top: 21%;
    right: 19%;
    width: 2.4em;
    height: 2.4em;
    border-radius: 50%;
  }

  .app-chrome {
    top: 12%;
    right: 9%;
    bottom: 12%;
    left: 9%;
    border-radius: var(--aos-radius-2);
  }

  .app-row {
    top: 38%;
    right: 17%;
    left: 17%;
    height: 1.2em;
    border-radius: 0.3em;
  }

  .app-row.short {
    top: 57%;
    right: 42%;
  }

  .workspace-window {
    top: 16%;
    bottom: 16%;
    left: 8%;
    width: 53%;
    border-radius: var(--aos-radius-2);
  }

  .workspace-window.secondary {
    right: 8%;
    left: auto;
    width: 29%;
  }

  figcaption {
    gap: var(--aos-space-2);
    margin-top: var(--aos-space-2);
  }

  figcaption span {
    font-weight: 620;
  }

  .stage-steps,
  .agent-list {
    display: grid;
    gap: var(--aos-space-2);
    margin: var(--aos-space-4) 0 0;
    padding: 0;
    list-style: none;
  }

  .stage-steps li,
  .agent-list li {
    padding: var(--aos-space-2) var(--aos-space-3);
    border: 1px solid var(--aos-keyline);
    border-radius: var(--aos-radius-2);
    color: var(--aos-text-muted);
    background: var(--aos-bg-muted);
  }

  .stage-steps li {
    display: grid;
    grid-template-columns: 2em 1fr;
    align-items: center;
  }

  .stage-steps li.current {
    border-left: 3px solid var(--aos-text);
    color: var(--aos-text);
  }

  .agent-list li {
    gap: var(--aos-space-2);
  }

  .agent-list li > span:last-child {
    margin-left: auto;
    color: var(--aos-text-muted);
    font-size: var(--aos-font-caption);
  }

  .agent-state {
    width: 0.5385em;
    height: 0.5385em;
    border: 1px solid currentColor;
    border-radius: 50%;
  }

  .diagnostic-summary {
    gap: var(--aos-space-3);
  }

  .diagnostic-summary p {
    display: grid;
  }

  footer {
    margin-top: var(--aos-space-4);
    padding-top: var(--aos-space-3);
    border-top: 1px solid var(--aos-keyline);
  }

  @keyframes stage-enter {
    from {
      opacity: 0;
      transform: translateY(0.6154em) scale(0.99);
    }
  }

  :global(.aos-design-system[data-aos-motion="reduced"]) .result-stage {
    animation-name: fade-only;
  }

  @keyframes fade-only {
    from { opacity: 0; }
  }
</style>
