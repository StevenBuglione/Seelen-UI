<script lang="ts">
  import { focusBoundary } from "../accessibility/focus-boundary.ts";
  import AosButton from "../components/AosButton.svelte";
  import OmarchyIcon from "../components/OmarchyIcon.svelte";
  import type { FixtureState } from "../state/types.ts";

  interface Props {
    state: FixtureState;
    onDeny?: () => void;
    onApprove?: () => void;
  }

  let { state, onDeny = () => {}, onApprove = () => {} }: Props = $props();
  const headingId = $derived(`sheet-heading-${state.fixture}`);
  const descriptionId = $derived(`sheet-description-${state.fixture}`);
</script>

<div
  class="approval-sheet"
  data-testid="surface-sheet"
  role="alertdialog"
  aria-modal="true"
  aria-labelledby={headingId}
  aria-describedby={descriptionId}
  {@attach focusBoundary}
>
  <header>
    <span class="sheet-icon" aria-hidden="true"><OmarchyIcon name={state.approval ? "shield" : "settings"} size={17} /></span>
    <div><p>{state.approval ? "Decision required" : state.status}</p><h2 id={headingId}>{state.heading}</h2></div>
    <span class="risk-label" data-risk={state.approval?.risk ?? "low"}>{state.approval ? `${state.approval.risk} risk` : "review"}</span>
  </header>

  <p id={descriptionId} class="sheet-message">{state.message}</p>

  {#if state.approval}
    <dl>
      <div><dt>Action</dt><dd>{state.approval.action}</dd></div>
      <div><dt>Target</dt><dd>{state.approval.target}</dd></div>
      <div><dt>Changes</dt><dd>{state.approval.data}</dd></div>
      <div><dt>Why</dt><dd>{state.approval.reason}</dd></div>
    </dl>
  {:else}
    <div class="contrast-sample"><span aria-hidden="true">Aa</span><p><strong>Visible by shape and label</strong><small>Color is never the only state signal.</small></p></div>
  {/if}

  <footer>
    <AosButton variant="secondary" safeDefault onclick={onDeny}>{state.approval ? "Deny" : "Dismiss"}</AosButton>
    {#if state.approval}
      <AosButton variant="primary" onclick={onApprove}>Allow once</AosButton>
      <AosButton variant="quiet" disabled={state.approval.risk === "high" || state.approval.allowForWorkflow === false}>Allow for workflow</AosButton>
    {:else}
      <AosButton variant="primary" onclick={onApprove}>Continue</AosButton>
    {/if}
  </footer>
  {#if state.approval}<p class="safe-note">No response safely denies when this request expires.</p>{/if}
</div>

<style>
  .approval-sheet {
    width: min(39em, 100%);
    max-height: 100%;
    overflow: auto;
    padding: var(--aos-space-4);
    border: 1px solid var(--aos-keyline-strong);
    border-radius: var(--aos-radius-4);
    background: var(--aos-bg-solid);
    box-shadow: var(--aos-shadow-large);
    animation: sheet-enter var(--aos-duration-appear) var(--aos-ease-out) both;
  }

  header {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--aos-space-3);
  }

  .sheet-icon {
    display: grid;
    width: 2.4615em;
    height: 2.4615em;
    place-items: center;
    border: 1px solid var(--aos-keyline);
    border-radius: var(--aos-radius-2);
    background: var(--aos-bg-muted);
  }

  h2,
  p {
    margin: 0;
  }

  header p,
  .risk-label,
  dt,
  .safe-note {
    color: var(--aos-text-muted);
    font-size: var(--aos-font-caption);
  }

  h2 {
    margin-top: 0.0769em;
    font-size: var(--aos-font-title);
    font-weight: 630;
  }

  .risk-label {
    padding: var(--aos-space-1) var(--aos-space-2);
    border: 1px solid var(--aos-keyline);
    border-radius: 999px;
    text-transform: capitalize;
  }

  .risk-label[data-risk="high"] {
    border-style: double;
    color: var(--aos-danger);
  }

  .sheet-message {
    margin-top: var(--aos-space-4);
    color: var(--aos-text-muted);
    font-size: var(--aos-font-body);
  }

  dl {
    display: grid;
    gap: var(--aos-space-2);
    margin: var(--aos-space-4) 0 0;
    padding: var(--aos-space-3);
    border: 1px solid var(--aos-keyline);
    border-radius: var(--aos-radius-3);
    background: var(--aos-bg-muted);
  }

  dl div {
    display: grid;
    grid-template-columns: 5.5em minmax(0, 1fr);
    gap: var(--aos-space-3);
  }

  dt,
  dd {
    margin: 0;
  }

  dd {
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: var(--aos-font-body);
  }

  .contrast-sample {
    display: flex;
    align-items: center;
    gap: var(--aos-space-3);
    margin-top: var(--aos-space-4);
    padding: var(--aos-space-3);
    border: 1px solid var(--aos-keyline);
  }

  .contrast-sample > span {
    font-size: var(--aos-font-display);
    font-weight: 700;
  }

  .contrast-sample p {
    display: grid;
  }

  .contrast-sample small {
    color: var(--aos-text-muted);
  }

  footer {
    display: flex;
    flex-direction: row-reverse;
    gap: var(--aos-space-2);
    margin-top: var(--aos-space-4);
  }

  .safe-note {
    margin-top: var(--aos-space-2);
    text-align: right;
  }

  @keyframes sheet-enter {
    from {
      opacity: 0;
      transform: translateY(0.9231em);
    }
  }

  :global(.aos-design-system[data-aos-motion="reduced"]) .approval-sheet {
    animation-name: fade-only;
  }

  @keyframes fade-only {
    from {
      opacity: 0;
    }
  }
</style>
