<script lang="ts">
  interface Props {
    value: number;
    label: string;
  }

  let { value, label }: Props = $props();
  const percent = $derived(Math.round(Math.max(0, Math.min(1, value)) * 100));
</script>

<label>
  <span>{label}</span>
  <output>{percent}%</output>
  <progress value={percent} max="100">{percent}%</progress>
</label>

<style>
  label {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--aos-space-1) var(--aos-space-3);
    color: var(--aos-text-muted);
    font-size: var(--aos-font-caption);
  }

  progress {
    width: 100%;
    height: 0.2308em;
    grid-column: 1 / -1;
    border: 0;
    border-radius: 999px;
    overflow: hidden;
    color: var(--aos-text);
    background: var(--aos-keyline);
    accent-color: var(--aos-text);
  }

  progress::-webkit-progress-bar {
    background: var(--aos-keyline);
  }

  progress::-webkit-progress-value {
    background: var(--aos-text);
  }
</style>
