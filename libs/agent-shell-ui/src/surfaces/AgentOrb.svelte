<script lang="ts">
  import VisuallyHidden from "../components/VisuallyHidden.svelte";
  import type { FixtureState } from "../state/types.ts";

  interface Props {
    state: FixtureState;
    expanded?: boolean;
    onInvoke?: () => void;
  }

  let { state, expanded = false, onInvoke = () => {} }: Props = $props();
</script>

<button
  type="button"
  class="agent-orb"
  class:hovered={state.fixture === "hovered"}
  data-testid="surface-orb"
  data-phase={state.phase}
  aria-label={expanded ? "Close Agent OS" : "Open Agent OS"}
  aria-expanded={expanded}
  aria-controls="agent-os-surface-layer"
  aria-haspopup="dialog"
  title="Agent OS · Ctrl Shift Space"
  onclick={onInvoke}
>
  <span class="orb-mark" aria-hidden="true"><span></span></span>
  <VisuallyHidden>{state.heading}</VisuallyHidden>
</button>

<style>
  .agent-orb {
    position: relative;
    display: grid;
    width: 19px;
    min-width: 19px;
    height: 18px;
    min-height: 18px;
    padding: 0;
    place-items: center;
    border: 0;
    border-radius: 3px;
    color: var(--shell-light-foreground, var(--aos-text));
    background: transparent;
    box-shadow: none;
    cursor: pointer;
    transition:
      color var(--aos-duration-press) ease-out,
      background var(--aos-duration-press) ease-out;
  }

  .agent-orb:hover,
  .agent-orb.hovered,
  .agent-orb[aria-expanded="true"] {
    color: var(--shell-foreground, var(--aos-text));
    background: var(--shell-lighter-background, var(--aos-bg-raised));
  }

  .agent-orb:focus-visible {
    outline: 1px solid color-mix(in srgb, currentColor 72%, transparent);
    outline-offset: -1px;
  }

  .orb-mark {
    position: relative;
    display: grid;
    width: 10px;
    height: 10px;
    place-items: center;
    border: 1px solid currentColor;
    border-radius: 50%;
    box-sizing: border-box;
  }

  .orb-mark span {
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: currentColor;
  }

  [data-phase="listening"] .orb-mark,
  [data-phase="user-speaking"] .orb-mark {
    border-radius: 50% 50% 46% 46%;
  }

  [data-phase="thinking"] .orb-mark,
  [data-phase="planning"] .orb-mark,
  [data-phase="acting"] .orb-mark,
  [data-phase="reconnecting"] .orb-mark {
    animation: orb-turn 1.4s linear infinite;
    border-right-color: transparent;
  }

  [data-phase="waiting-for-approval"] .orb-mark {
    border-radius: 3px;
  }

  [data-phase="error"] .orb-mark {
    border-color: var(--aos-danger);
    color: var(--aos-danger);
  }

  [data-phase="completed"] .orb-mark {
    border-radius: 3px 50% 50%;
    transform: rotate(45deg);
  }

  :global(.aos-design-system[data-aos-motion="reduced"]) .orb-mark {
    animation: none;
  }

  @keyframes orb-turn {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .orb-mark {
      animation: none !important;
    }
  }
</style>
