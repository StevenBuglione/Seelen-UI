<script lang="ts">
  import type { FixtureSnapshot, MotionMode, StudioTheme } from "../state/types.ts";

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
</script>

<section
  class="fixture-preview"
  class:reduced-motion={motion === "reduced"}
  data-testid="preview-canvas"
  data-fixture={snapshot.state.fixture}
  data-phase={snapshot.state.phase}
  data-theme={theme}
  data-motion={motion}
  aria-label={`Agent OS ${snapshot.state.fixture} fixture preview`}
  style={`--fixture-dpi: ${dpiScale}`}
>
  <div class="monitor-grid" class:multi-monitor={monitorCount === 2}>
    {#each Array.from({ length: monitorCount }) as _, index}
      <article class="monitor" aria-label={`Fixture monitor ${index + 1}`}>
        <header class="monitor-label">
          <span>Monitor {index + 1}</span>
          {#if index === 0}<span>Active</span>{/if}
        </header>

        <div class="desktop" inert={index !== 0}>
          <div class="wallpaper-mark" aria-hidden="true">AOS</div>

          {#if index === 0}
            <div class="surface-stack" aria-live="polite">
              <div class="status-node" data-kind="orb" aria-label={`Agent status: ${snapshot.state.status}`}>
                <span class="status-glyph" aria-hidden="true"></span>
              </div>

              {#if snapshot.plan.surfaces.length > 1}
                <section class="fixture-surface" aria-labelledby="fixture-heading">
                  <div class="surface-kinds" aria-label="Planned surfaces">
                    {#each snapshot.plan.surfaces.slice(1) as surface}
                      <span>{surface.kind}</span>
                    {/each}
                  </div>
                  <p class="eyebrow">{snapshot.state.status}</p>
                  <h2 id="fixture-heading">{snapshot.state.heading}</h2>
                  <p>{snapshot.state.message}</p>

                  {#if snapshot.state.transcript}
                    <blockquote>{snapshot.state.transcript}</blockquote>
                  {/if}

                  {#if snapshot.state.progress !== undefined}
                    <label>
                      <span>Progress {Math.round(snapshot.state.progress * 100)}%</span>
                      <progress value={snapshot.state.progress} max="1"></progress>
                    </label>
                  {/if}

                  {#if snapshot.state.steps}
                    <ol>
                      {#each snapshot.state.steps as step}<li>{step}</li>{/each}
                    </ol>
                  {/if}

                  {#if snapshot.state.approval}
                    <div class="approval" role="group" aria-label="Approval fixture">
                      <strong>{snapshot.state.approval.action}</strong>
                      <span>Risk: {snapshot.state.approval.risk}</span>
                      <div class="fixture-actions">
                        <button type="button" disabled={snapshot.state.approval.denied}>Approve</button>
                        <button type="button">Deny</button>
                      </div>
                    </div>
                  {/if}

                  {#if snapshot.state.artifact}
                    <figure class="artifact" data-kind={snapshot.state.artifact.kind}>
                      <div aria-hidden="true"></div>
                      <figcaption>{snapshot.state.artifact.label}</figcaption>
                    </figure>
                  {/if}

                  {#if snapshot.state.agents}
                    <ul class="agents" aria-label="Agent progress">
                      {#each snapshot.state.agents as agent}
                        <li><strong>{agent.name}</strong><span>{agent.status}</span></li>
                      {/each}
                    </ul>
                  {/if}
                </section>
              {/if}
            </div>
          {/if}

          <footer class="fixture-note">Fixture canvas · no native shell connection</footer>
        </div>
      </article>
    {/each}
  </div>
</section>

<style>
  .fixture-preview {
    --preview-bg: #0d1117;
    --preview-surface: rgba(22, 27, 34, 0.96);
    --preview-border: rgba(255, 255, 255, 0.16);
    --preview-text: #f2f4f7;
    --preview-muted: #aab4c3;
    --preview-accent: #9ec7ff;
    --preview-focus: #ffdc7a;
    width: 100%;
    color: var(--preview-text);
    font: calc(14px * var(--fixture-dpi)) / 1.45 Inter, "Segoe UI", sans-serif;
  }

  .fixture-preview[data-theme="light"] {
    --preview-bg: #e9edf3;
    --preview-surface: rgba(255, 255, 255, 0.98);
    --preview-border: rgba(13, 17, 23, 0.2);
    --preview-text: #111820;
    --preview-muted: #536170;
    --preview-accent: #245da8;
    --preview-focus: #8a4b00;
  }

  .fixture-preview[data-theme="high-contrast"] {
    --preview-bg: #000;
    --preview-surface: #000;
    --preview-border: #fff;
    --preview-text: #fff;
    --preview-muted: #fff;
    --preview-accent: #ff0;
    --preview-focus: #0ff;
  }

  .monitor-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .monitor-grid.multi-monitor {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  }

  .monitor {
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--preview-border);
    border-radius: 12px;
    background: #090b0e;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.24);
  }

  .monitor-label {
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
    color: #c6ced9;
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .desktop {
    position: relative;
    display: grid;
    min-height: 440px;
    place-items: center;
    overflow: hidden;
    background:
      radial-gradient(circle at 70% 20%, color-mix(in srgb, var(--preview-accent) 18%, transparent), transparent 34%),
      linear-gradient(145deg, color-mix(in srgb, var(--preview-bg) 78%, #2a3340), var(--preview-bg));
  }

  .multi-monitor .desktop {
    min-height: 360px;
  }

  .wallpaper-mark {
    position: absolute;
    top: 32px;
    left: 36px;
    color: color-mix(in srgb, var(--preview-text) 8%, transparent);
    font-size: 92px;
    font-weight: 700;
    letter-spacing: -0.08em;
  }

  .surface-stack {
    z-index: 1;
    display: flex;
    max-width: min(540px, calc(100% - 48px));
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .status-node {
    display: grid;
    width: 52px;
    height: 52px;
    place-items: center;
    border: 1px solid var(--preview-border);
    border-radius: 50%;
    background: var(--preview-surface);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
  }

  .status-glyph {
    width: 14px;
    height: 14px;
    border: 2px solid var(--preview-accent);
    border-radius: 50%;
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--preview-accent) 13%, transparent);
  }

  [data-phase="thinking"] .status-glyph,
  [data-phase="acting"] .status-glyph,
  [data-phase="reconnecting"] .status-glyph {
    animation: fixture-pulse 1.4s ease-in-out infinite;
  }

  .reduced-motion .status-glyph {
    animation: none;
  }

  .fixture-surface {
    width: 100%;
    box-sizing: border-box;
    padding: 22px;
    border: 1px solid var(--preview-border);
    border-radius: 16px;
    background: var(--preview-surface);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.28);
  }

  .surface-kinds {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }

  .surface-kinds span {
    padding: 3px 8px;
    border: 1px solid var(--preview-border);
    border-radius: 999px;
    color: var(--preview-muted);
    font-size: 11px;
    text-transform: uppercase;
  }

  .eyebrow {
    margin: 0 0 4px;
    color: var(--preview-accent);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  h2,
  p,
  blockquote {
    margin: 0;
  }

  h2 {
    margin-bottom: 6px;
    font-size: 22px;
    line-height: 1.2;
  }

  p,
  blockquote,
  li,
  label {
    color: var(--preview-muted);
  }

  blockquote {
    margin-top: 14px;
    padding-left: 12px;
    border-left: 2px solid var(--preview-accent);
  }

  progress {
    width: 100%;
    accent-color: var(--preview-accent);
  }

  label,
  .approval,
  .artifact,
  .agents {
    display: grid;
    gap: 8px;
    margin: 16px 0 0;
  }

  .approval {
    padding: 14px;
    border: 1px solid var(--preview-border);
    border-radius: 10px;
  }

  .fixture-actions {
    display: flex;
    gap: 8px;
  }

  button {
    padding: 8px 12px;
    border: 1px solid var(--preview-border);
    border-radius: 8px;
    color: var(--preview-text);
    background: transparent;
  }

  button:focus-visible {
    outline: 3px solid var(--preview-focus);
    outline-offset: 2px;
  }

  .artifact {
    padding: 12px;
    border: 1px solid var(--preview-border);
    border-radius: 10px;
  }

  .artifact div {
    min-height: 96px;
    border-radius: 7px;
    background:
      linear-gradient(135deg, transparent 42%, color-mix(in srgb, var(--preview-accent) 28%, transparent) 42% 58%, transparent 58%),
      color-mix(in srgb, var(--preview-accent) 8%, var(--preview-bg));
  }

  .artifact figcaption {
    color: var(--preview-muted);
  }

  .agents {
    padding: 0;
    list-style: none;
  }

  .agents li {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--preview-border);
  }

  .fixture-note {
    position: absolute;
    right: 14px;
    bottom: 10px;
    color: color-mix(in srgb, var(--preview-muted) 68%, transparent);
    font-size: 10px;
    letter-spacing: 0.03em;
  }

  @keyframes fixture-pulse {
    50% {
      opacity: 0.42;
      transform: scale(0.8);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .status-glyph {
      animation: none !important;
    }
  }
</style>
