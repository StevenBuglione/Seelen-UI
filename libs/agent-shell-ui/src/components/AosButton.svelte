<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    label?: string;
    variant?: "quiet" | "secondary" | "primary" | "danger";
    type?: "button" | "submit";
    disabled?: boolean;
    pressed?: boolean;
    safeDefault?: boolean;
    onclick?: (event: MouseEvent) => void;
  }

  let {
    children,
    label,
    variant = "secondary",
    type = "button",
    disabled = false,
    pressed,
    safeDefault = false,
    onclick,
  }: Props = $props();
</script>

<button
  {type}
  {disabled}
  {onclick}
  class:quiet={variant === "quiet"}
  class:primary={variant === "primary"}
  class:danger={variant === "danger"}
  aria-label={label}
  aria-pressed={pressed}
  data-safe-default={safeDefault ? "true" : undefined}
>
  {@render children()}
</button>

<style>
  button {
    display: inline-flex;
    min-height: 2.3077em;
    align-items: center;
    justify-content: center;
    gap: var(--aos-space-2);
    padding: 0 var(--aos-space-3);
    border: 1px solid var(--aos-keyline);
    border-radius: var(--aos-radius-2);
    color: var(--aos-text);
    background: var(--aos-bg-muted);
    font: inherit;
    font-size: var(--aos-font-body);
    font-weight: 580;
    cursor: pointer;
    transition:
      background var(--aos-duration-press) ease-out,
      border-color var(--aos-duration-press) ease-out,
      opacity var(--aos-duration-press) ease-out;
  }

  button:hover,
  button[aria-pressed="true"] {
    border-color: var(--aos-keyline-strong);
    background: color-mix(in srgb, var(--aos-text) 11%, var(--aos-bg-muted));
  }

  button:active {
    opacity: 0.72;
  }

  button:focus-visible {
    outline: 2px solid var(--aos-focus);
    outline-offset: 2px;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  button.quiet {
    border-color: transparent;
    background: transparent;
  }

  button.primary {
    color: var(--aos-bg-solid);
    background: var(--aos-text);
  }

  button.danger {
    border-color: color-mix(in srgb, var(--aos-danger) 48%, var(--aos-keyline));
    color: var(--aos-danger);
  }
</style>
