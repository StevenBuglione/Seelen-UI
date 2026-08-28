<script lang="ts">
  import AosButton from "../components/AosButton.svelte";
  import OmarchyIcon from "../components/OmarchyIcon.svelte";
  import type { FixtureState } from "../state/types.ts";

  let { state, onDismiss = () => {} }: { state: FixtureState; onDismiss?: () => void } = $props();
  const headingId = $derived(`sidecar-heading-${state.fixture}`);
</script>

<aside class="agent-sidecar" data-testid="surface-sidecar" aria-labelledby={headingId}>
  <header><div><p>Context lens</p><h2 id={headingId}>{state.heading}</h2></div><AosButton variant="quiet" label="Close context lens" onclick={onDismiss}><OmarchyIcon name="close" size={13} /></AosButton></header>
  <p class="sidecar-message">{state.message}</p>
  {#if state.context}
    <section aria-label="Focused application">
      <span class="app-symbol" aria-hidden="true"><OmarchyIcon name="code" size={18} /></span>
      <div><small>Focused application</small><strong>{state.context.application}</strong><span>{state.context.title}</span></div>
    </section>
    <ul>{#each state.context.details as detail}<li><OmarchyIcon name="check" size={11} />{detail}</li>{/each}</ul>
  {/if}
  <footer><span><OmarchyIcon name="shield" size={11} /> Local context only</span><AosButton variant="secondary">Show actions</AosButton></footer>
</aside>

<style>
  .agent-sidecar {
    width: min(26em, 100%);
    max-height: 100%;
    overflow: auto;
    padding: var(--aos-space-4);
    border: 1px solid var(--aos-keyline-strong);
    border-radius: var(--aos-radius-4);
    background: var(--aos-bg-solid);
    box-shadow: var(--aos-shadow-large);
    animation: sidecar-enter var(--aos-duration-appear) var(--aos-ease-out) both;
  }

  header,
  section,
  footer,
  li {
    display: flex;
    align-items: center;
  }

  header,
  footer {
    justify-content: space-between;
  }

  h2,
  p,
  ul {
    margin: 0;
  }

  header p,
  .sidecar-message,
  small,
  section span,
  li,
  footer {
    color: var(--aos-text-muted);
  }

  header p,
  small,
  li,
  footer {
    font-size: var(--aos-font-caption);
  }

  h2 {
    font-size: var(--aos-font-title);
  }

  .sidecar-message {
    margin-top: var(--aos-space-3);
    font-size: var(--aos-font-body);
  }

  section {
    gap: var(--aos-space-3);
    margin-top: var(--aos-space-4);
    padding: var(--aos-space-3);
    border: 1px solid var(--aos-keyline);
    border-radius: var(--aos-radius-3);
    background: var(--aos-bg-muted);
  }

  .app-symbol {
    display: grid;
    width: 2.7692em;
    height: 2.7692em;
    place-items: center;
    border: 1px solid var(--aos-keyline);
    border-radius: var(--aos-radius-2);
  }

  section div {
    display: grid;
  }

  section strong {
    font-size: var(--aos-font-body);
  }

  ul {
    display: grid;
    gap: var(--aos-space-2);
    padding: var(--aos-space-4) 0;
    list-style: none;
  }

  li {
    gap: var(--aos-space-2);
  }

  footer {
    padding-top: var(--aos-space-3);
    border-top: 1px solid var(--aos-keyline);
  }

  footer > span {
    display: flex;
    align-items: center;
    gap: var(--aos-space-1);
  }

  @keyframes sidecar-enter {
    from {
      opacity: 0;
      transform: translateX(0.9231em);
    }
  }

  :global(.aos-design-system[data-aos-motion="reduced"]) .agent-sidecar {
    animation-name: fade-only;
  }

  @keyframes fade-only { from { opacity: 0; } }
</style>
