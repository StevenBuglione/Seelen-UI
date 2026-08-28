<script lang="ts">
  import OmarchyIcon from "../components/OmarchyIcon.svelte";
  import type { OmarchyIconName } from "../components/omarchy-icon-types.ts";
  import wallpaperUrl from "../assets/omarchy/vantablack-layers-deep.webp?url";
  import {
    getOmarchyTheme,
    omarchyThemeStyle,
    type OmarchyThemeId,
  } from "../themes/omarchy.ts";
  import type { MotionMode } from "../state/types.ts";
  import type { ShellLayout, ShellPanel, ShellWorkspaceId } from "../shell/types.ts";

  interface Props {
    themeId?: OmarchyThemeId;
    motion?: MotionMode;
    monitorCount?: 1 | 2;
    panel?: ShellPanel;
    layout?: ShellLayout;
    workspace?: ShellWorkspaceId;
    onPanelChange?: (panel: ShellPanel) => void;
    onLayoutChange?: (layout: ShellLayout) => void;
    onWorkspaceChange?: (workspace: ShellWorkspaceId) => void;
  }

  interface ShellApp {
    name: string;
    icon: OmarchyIconName;
    category: "Create" | "Develop" | "System" | "Media";
    shortcut: string;
  }

  interface ShellWindow {
    app: string;
    title: string;
    icon: OmarchyIconName;
    kind: "terminal" | "code" | "browser" | "files" | "music" | "notes";
  }

  const apps: readonly ShellApp[] = [
    { name: "Terminal", icon: "terminal", category: "Develop", shortcut: "Super T" },
    { name: "Code", icon: "code", category: "Develop", shortcut: "Super C" },
    { name: "Browser", icon: "globe", category: "Create", shortcut: "Super B" },
    { name: "Files", icon: "folder", category: "System", shortcut: "Super F" },
    { name: "Music", icon: "music", category: "Media", shortcut: "Super M" },
    { name: "Notes", icon: "appWindow", category: "Create", shortcut: "Super N" },
    { name: "Settings", icon: "settings", category: "System", shortcut: "Super I" },
    { name: "Themes", icon: "paintbrush", category: "System", shortcut: "Super Shift T" },
  ];

  const workspaceNames: Record<ShellWorkspaceId, string> = {
    1: "Build",
    2: "Research",
    3: "Design",
    4: "Media",
    5: "Focus",
  };

  const workspaceWindows: Record<ShellWorkspaceId, readonly ShellWindow[]> = {
    1: [
      { app: "Terminal", title: "agent-os-shell — pwsh", icon: "terminal", kind: "terminal" },
      { app: "Code", title: "ShellExperience.svelte", icon: "code", kind: "code" },
      { app: "Browser", title: "Omarchy — GitHub", icon: "globe", kind: "browser" },
    ],
    2: [
      { app: "Browser", title: "Omarchy Manual", icon: "globe", kind: "browser" },
      { app: "Notes", title: "Shell compatibility notes", icon: "appWindow", kind: "notes" },
      { app: "Terminal", title: "reference inventory", icon: "terminal", kind: "terminal" },
    ],
    3: [
      { app: "Code", title: "theme-contract.ts", icon: "code", kind: "code" },
      { app: "Files", title: "Vantablack", icon: "folder", kind: "files" },
      { app: "Browser", title: "Visual QA", icon: "globe", kind: "browser" },
    ],
    4: [
      { app: "Music", title: "Deep focus radio", icon: "music", kind: "music" },
      { app: "Browser", title: "Reading list", icon: "globe", kind: "browser" },
      { app: "Notes", title: "Today", icon: "appWindow", kind: "notes" },
    ],
    5: [
      { app: "Terminal", title: "quiet workspace", icon: "terminal", kind: "terminal" },
    ],
  };

  let {
    themeId = "vantablack",
    motion = "normal",
    monitorCount = 1,
    panel = "none",
    layout = "dwindle",
    workspace = 1,
    onPanelChange = () => {},
    onLayoutChange = () => {},
    onWorkspaceChange = () => {},
  }: Props = $props();

  let query = $state("");
  let wifiEnabled = $state(true);
  let bluetoothEnabled = $state(true);
  let nightLightEnabled = $state(false);
  let doNotDisturb = $state(false);
  let volume = $state(62);
  let brightness = $state(78);
  let launchedApp = $state<string | null>(null);

  const theme = $derived(getOmarchyTheme(themeId));
  const themeStyle = $derived(omarchyThemeStyle(theme));
  const filteredApps = $derived(
    apps.filter((app) => app.name.toLowerCase().includes(query.trim().toLowerCase())),
  );
  const windows = $derived(workspaceWindows[workspace]);

  function togglePanel(next: Exclude<ShellPanel, "none">): void {
    onPanelChange(panel === next ? "none" : next);
  }

  function launch(app: ShellApp): void {
    launchedApp = app.name;
    query = "";
    onPanelChange("none");
  }

  function handleKeyboard(event: KeyboardEvent): void {
    if (event.key === "Escape" && panel !== "none") {
      event.preventDefault();
      onPanelChange("none");
      return;
    }
    if (event.ctrlKey && event.key === " ") {
      event.preventDefault();
      togglePanel("launcher");
      return;
    }
    if (event.altKey && /^[1-5]$/.test(event.key)) {
      event.preventDefault();
      onWorkspaceChange(Number(event.key) as ShellWorkspaceId);
    }
  }
</script>

<svelte:window onkeydown={handleKeyboard} />

<section
  class="shell-experience"
  class:reduced-motion={motion === "reduced"}
  data-testid="shell-canvas"
  data-theme={themeId}
  data-theme-mode={theme.mode}
  data-panel={panel}
  data-layout={layout}
  data-workspace={workspace}
  aria-label="Omarchy-compatible Agent OS shell experience"
  style={themeStyle}
>
  <div class="monitor-grid" class:multi-monitor={monitorCount === 2}>
    {#each Array.from({ length: monitorCount }) as _, monitorIndex}
      <article class="monitor" aria-label={`Shell monitor ${monitorIndex + 1}`}>
        <div class="desktop" style={`--shell-wallpaper:url("${wallpaperUrl}")`} inert={monitorIndex !== 0}>
          <header class="top-bar" aria-label="Desktop top bar">
            <div class="bar-zone bar-left">
              <button
                class:active={panel === "launcher"}
                class="bar-button brand-button"
                type="button"
                aria-label="Open applications"
                aria-expanded={panel === "launcher"}
                onclick={() => togglePanel("launcher")}
              >
                <OmarchyIcon name="menu" size={14} />
              </button>
              <nav class="workspaces" aria-label="Workspaces">
                {#each [1, 2, 3, 4, 5] as workspaceId}
                  <button
                    type="button"
                    class:active={workspace === workspaceId}
                    aria-current={workspace === workspaceId ? "page" : undefined}
                    aria-label={`Workspace ${workspaceId}: ${workspaceNames[workspaceId as ShellWorkspaceId]}`}
                    onclick={() => onWorkspaceChange(workspaceId as ShellWorkspaceId)}
                  >{workspaceId}</button>
                {/each}
              </nav>
            </div>

            <div class="bar-center">
              <button
                class:active={panel === "calendar"}
                class="clock-button"
                type="button"
                aria-label="Open calendar"
                aria-expanded={panel === "calendar"}
                onclick={() => togglePanel("calendar")}
              >
                <span>Wednesday</span>
                <strong>14:32</strong>
              </button>
              <span class="bar-separator" aria-hidden="true"></span>
              <span class="weather"><OmarchyIcon name="cloudSun" size={13} /> 72°</span>
            </div>

            <div class="bar-zone bar-right">
              <button
                type="button"
                class:active={panel === "notifications"}
                class="bar-button notification-button"
                aria-label="Open notifications"
                aria-expanded={panel === "notifications"}
                onclick={() => togglePanel("notifications")}
              >
                <OmarchyIcon name="bell" size={13} />
                <span class="notification-dot" aria-label="2 unread notifications"></span>
              </button>
              <button
                type="button"
                class:active={panel === "quick-settings"}
                class="system-cluster"
                aria-label="Open quick settings"
                aria-expanded={panel === "quick-settings"}
                onclick={() => togglePanel("quick-settings")}
              >
                <OmarchyIcon name="bluetooth" size={12} />
                <OmarchyIcon name="wifi" size={13} />
                <OmarchyIcon name="volume" size={13} />
                <OmarchyIcon name="battery" size={14} />
                <span>82%</span>
              </button>
              <button
                type="button"
                class:active={panel === "overview"}
                class="bar-button"
                aria-label="Open workspace overview"
                aria-expanded={panel === "overview"}
                onclick={() => togglePanel("overview")}
              ><OmarchyIcon name="grid" size={13} /></button>
            </div>
          </header>

          <main class="desktop-content" aria-label={`${workspaceNames[workspace]} workspace`}>
            <div class="workspace-meta" aria-hidden="true">
              <span>{workspace}</span>
              <div><strong>{workspaceNames[workspace]}</strong><small>{layout} layout</small></div>
            </div>

            <div class="window-layout" data-window-count={windows.length}>
              {#each windows as shellWindow, index}
                <article class="app-window" data-index={index} data-kind={shellWindow.kind} aria-label={`${shellWindow.app}: ${shellWindow.title}`}>
                  <header class="window-titlebar">
                    <span class="app-identity"><OmarchyIcon name={shellWindow.icon} size={13} />{shellWindow.title}</span>
                    <span class="window-actions" aria-hidden="true">
                      <OmarchyIcon name="minimize" size={11} />
                      <OmarchyIcon name="maximize" size={10} />
                      <OmarchyIcon name="close" size={11} />
                    </span>
                  </header>
                  <div class="window-body">
                    {#if shellWindow.kind === "terminal"}
                      <div class="terminal-view">
                        <p><span>steve</span>@agent-os <em>codex/M02-shared-ui-shell-studio</em></p>
                        <p class="command-line">› npm run studio</p>
                        <p class="terminal-success">VITE ready in 412 ms</p>
                        <p>Local: http://127.0.0.1:4173/</p>
                        <p class="command-line">› git status --short</p>
                        <p><em>M</em> tools/shell-studio/src/App.svelte</p>
                        <p><em>?</em> libs/agent-shell-ui/src/themes/omarchy.ts</p>
                        <p><em>?</em> docs/agent-os/upstream/omarchy.lock.json</p>
                        <p class="command-line">› npm run studio:test:interactions</p>
                        <p class="terminal-success">8 passed · 0 failed · 5.2s</p>
                        <p class="terminal-rule">────────────────────────────────────</p>
                        <p>theme <span>vantablack</span> &nbsp; layout <span>dwindle</span></p>
                        <p>source <em>basecamp/omarchy@83881e9</em></p>
                        <p class="cursor-line">› <span class="terminal-cursor" aria-hidden="true"></span></p>
                      </div>
                    {:else if shellWindow.kind === "code"}
                      <div class="code-view">
                        <aside aria-hidden="true"><OmarchyIcon name="folder" size={12} /><OmarchyIcon name="search" size={12} /><OmarchyIcon name="code" size={12} /></aside>
                        <div class="editor">
                          <div class="editor-tab"><OmarchyIcon name="code" size={11} />ShellExperience.svelte</div>
                          <ol>
                            <li><span class="syntax-key">import</span> TopBar <span class="syntax-key">from</span> <span class="syntax-value">"./TopBar.svelte"</span>;</li>
                            <li><span class="syntax-key">import</span> Workspace <span class="syntax-key">from</span> <span class="syntax-value">"./Workspace.svelte"</span>;</li>
                            <li>&nbsp;</li>
                            <li><span class="syntax-key">const</span> shell = getTheme(<span class="syntax-value">"vantablack"</span>);</li>
                            <li><span class="syntax-key">const</span> layout = <span class="syntax-value">"dwindle"</span>;</li>
                            <li>&nbsp;</li>
                            <li><span class="syntax-dim">&lt;section</span> class=<span class="syntax-value">"shell-experience"</span><span class="syntax-dim">&gt;</span></li>
                            <li>  <span class="syntax-key">&lt;TopBar</span> source=<span class="syntax-value">"omarchy"</span> <span class="syntax-key">/&gt;</span></li>
                            <li>  <span class="syntax-key">&lt;Workspace</span> layout={layout} theme=<span class="syntax-value">shell</span> <span class="syntax-key">/&gt;</span></li>
                            <li>  <span class="syntax-key">&lt;ContextPanels</span> mode=<span class="syntax-value">"deferred"</span> <span class="syntax-key">/&gt;</span></li>
                            <li><span class="syntax-dim">&lt;/section&gt;</span></li>
                          </ol>
                        </div>
                      </div>
                    {:else if shellWindow.kind === "browser"}
                      <div class="browser-view">
                        <div class="browser-toolbar">
                          <span class="browser-nav">‹ &nbsp; › &nbsp; ↻</span>
                          <span class="address"><OmarchyIcon name="shield" size={10} /> github.com/basecamp/omarchy</span>
                        </div>
                        <div class="repository-view">
                          <div class="repo-mark"><OmarchyIcon name="terminal" size={24} /></div>
                          <div><small>basecamp /</small><h3>omarchy</h3><p>Opinionated Arch/Hyprland setup.</p></div>
                          <span class="repo-branch">quattro</span>
                        </div>
                        <div class="repo-list"><span>config <small>Shell and keybinding configuration</small></span><span>themes <small>22 declarative desktop themes</small></span><span>manual <small>Experience and workflow documentation</small></span><span>shell <small>Quickshell components and plugins</small></span></div>
                      </div>
                    {:else if shellWindow.kind === "files"}
                      <div class="files-view">
                        <aside><p>Favorites</p><span><OmarchyIcon name="folder" size={12} /> Themes</span><span><OmarchyIcon name="hardDrive" size={12} /> Local disk</span></aside>
                        <div class="file-grid">
                          {#each ["colors.toml", "preview.png", "backgrounds", "icons.theme"] as file, fileIndex}
                            <div><OmarchyIcon name={fileIndex === 2 ? "folder" : "appWindow"} size={22} /><span>{file}</span></div>
                          {/each}
                        </div>
                      </div>
                    {:else if shellWindow.kind === "music"}
                      <div class="music-view">
                        <div class="album-art"><OmarchyIcon name="music" size={38} /></div>
                        <div><small>Now playing</small><h3>Weightless</h3><p>Ambient Works</p><div class="track"><span></span></div></div>
                      </div>
                    {:else}
                      <div class="notes-view">
                        <p class="note-date">Wednesday · August 27</p>
                        <h3>Shell baseline</h3>
                        <ul><li>Omarchy bar and workspace grammar</li><li>Contextual panels, never a dashboard</li><li>Agent layer remains deferred</li></ul>
                      </div>
                    {/if}
                  </div>
                </article>
              {/each}
            </div>
          </main>

          {#if panel !== "none" && monitorIndex === 0}
            <button class="panel-scrim" type="button" aria-label="Close panel" onclick={() => onPanelChange("none")}></button>
          {/if}

          {#if panel === "launcher" && monitorIndex === 0}
            <section class="shell-panel launcher-panel" aria-label="Application launcher">
              <header class="launcher-search">
                <OmarchyIcon name="search" size={16} />
                <input bind:value={query} aria-label="Search applications" placeholder="Search apps, files, and commands" />
                <kbd>Esc</kbd>
              </header>
              <div class="launcher-context">
                <span>Applications</span><span>Commands</span><span>Windows</span>
              </div>
              <div class="app-grid">
                {#each filteredApps as app}
                  <button type="button" onclick={() => launch(app)}>
                    <span class="app-icon"><OmarchyIcon name={app.icon} size={21} /></span>
                    <span><strong>{app.name}</strong><small>{app.category}</small></span>
                    <kbd>{app.shortcut}</kbd>
                  </button>
                {/each}
              </div>
              <footer><span><OmarchyIcon name="command" size={12} /> Ctrl Space</span><span>Launch selected app</span></footer>
            </section>
          {:else if panel === "calendar" && monitorIndex === 0}
            <section class="shell-panel calendar-panel" aria-label="Calendar and agenda">
              <header><div><p>Wednesday</p><h2>August 27</h2></div><div class="weather-large"><OmarchyIcon name="cloudSun" size={22} /><span><strong>72°</strong><small>Clear</small></span></div></header>
              <div class="calendar-grid" aria-label="August 2026 calendar">
                {#each ["M", "T", "W", "T", "F", "S", "S"] as day}<strong>{day}</strong>{/each}
                {#each Array.from({ length: 31 }) as _, day}
                  <button type="button" class:today={day + 1 === 27}>{day + 1}</button>
                {/each}
              </div>
              <div class="agenda">
                <div><time>10:00</time><span><strong>Shell review</strong><small>Design system</small></span></div>
                <div><time>14:30</time><span><strong>Deep work</strong><small>Agent OS</small></span></div>
                <div><time>17:00</time><span><strong>Daily wrap</strong><small>Personal</small></span></div>
              </div>
            </section>
          {:else if panel === "quick-settings" && monitorIndex === 0}
            <section class="shell-panel quick-settings-panel" aria-label="Quick settings">
              <header><span class="user-avatar"><OmarchyIcon name="user" size={22} /></span><div><strong>Steve</strong><small>Agent OS workstation</small></div><button type="button" aria-label="Open settings"><OmarchyIcon name="settings" size={15} /></button></header>
              <div class="quick-toggles">
                <button type="button" class:enabled={wifiEnabled} aria-pressed={wifiEnabled} onclick={() => (wifiEnabled = !wifiEnabled)}><OmarchyIcon name="wifi" size={17} /><span><strong>Wi-Fi</strong><small>{wifiEnabled ? "Connected" : "Off"}</small></span></button>
                <button type="button" class:enabled={bluetoothEnabled} aria-pressed={bluetoothEnabled} onclick={() => (bluetoothEnabled = !bluetoothEnabled)}><OmarchyIcon name="bluetooth" size={17} /><span><strong>Bluetooth</strong><small>{bluetoothEnabled ? "On" : "Off"}</small></span></button>
                <button type="button" class:enabled={nightLightEnabled} aria-pressed={nightLightEnabled} onclick={() => (nightLightEnabled = !nightLightEnabled)}><OmarchyIcon name="moon" size={17} /><span><strong>Night light</strong><small>{nightLightEnabled ? "On" : "Off"}</small></span></button>
                <button type="button" class:enabled={doNotDisturb} aria-pressed={doNotDisturb} onclick={() => (doNotDisturb = !doNotDisturb)}><OmarchyIcon name="bell" size={17} /><span><strong>Do not disturb</strong><small>{doNotDisturb ? "On" : "Off"}</small></span></button>
              </div>
              <label class="slider-row"><OmarchyIcon name="sun" size={16} /><span>Brightness</span><input type="range" min="0" max="100" bind:value={brightness} aria-label="Brightness" /><output>{brightness}%</output></label>
              <label class="slider-row"><OmarchyIcon name="volume" size={16} /><span>Volume</span><input type="range" min="0" max="100" bind:value={volume} aria-label="Volume" /><output>{volume}%</output></label>
              <div class="system-metrics">
                <span><OmarchyIcon name="cpu" size={13} /> CPU <strong>12%</strong></span>
                <span><OmarchyIcon name="memory" size={13} /> RAM <strong>38%</strong></span>
                <span><OmarchyIcon name="battery" size={13} /> Battery <strong>82%</strong></span>
              </div>
              <footer><button type="button"><OmarchyIcon name="power" size={14} /> Power</button><button type="button"><OmarchyIcon name="reset" size={14} /> Restart shell</button></footer>
            </section>
          {:else if panel === "notifications" && monitorIndex === 0}
            <section class="shell-panel notifications-panel" aria-label="Notifications">
              <header><div><p>Notifications</p><h2>Today</h2></div><button type="button">Clear all</button></header>
              <article><span class="notification-icon"><OmarchyIcon name="shield" size={16} /></span><div><strong>Windows Security</strong><p>No new threats were found.</p><time>2 min ago</time></div></article>
              <article><span class="notification-icon"><OmarchyIcon name="code" size={16} /></span><div><strong>Visual Studio Code</strong><p>Extension updates are ready.</p><time>18 min ago</time></div></article>
              <article><span class="notification-icon"><OmarchyIcon name="calendar" size={16} /></span><div><strong>Shell review</strong><p>Design review begins in 30 minutes.</p><time>1 hr ago</time></div></article>
              <footer><OmarchyIcon name="moon" size={13} /> Do not disturb is off</footer>
            </section>
          {:else if panel === "overview" && monitorIndex === 0}
            <section class="overview-panel" aria-label="Workspace overview">
              <header><div><p>Workspace overview</p><h2>Choose where to work</h2></div><div class="layout-switcher" aria-label="Window layout">
                {#each ["dwindle", "master", "columns", "monocle"] as layoutName}
                  <button type="button" class:active={layout === layoutName} aria-pressed={layout === layoutName} onclick={() => onLayoutChange(layoutName as ShellLayout)}>{layoutName}</button>
                {/each}
              </div></header>
              <div class="overview-grid">
                {#each [1, 2, 3, 4, 5] as workspaceId}
                  <button type="button" class:active={workspace === workspaceId} onclick={() => { onWorkspaceChange(workspaceId as ShellWorkspaceId); onPanelChange("none"); }}>
                    <span class="overview-number">0{workspaceId}</span>
                    <span class="overview-title"><strong>{workspaceNames[workspaceId as ShellWorkspaceId]}</strong><small>{workspaceWindows[workspaceId as ShellWorkspaceId].length} open {workspaceWindows[workspaceId as ShellWorkspaceId].length === 1 ? "window" : "windows"}</small></span>
                    <span class="overview-apps">
                      {#each workspaceWindows[workspaceId as ShellWorkspaceId] as previewWindow}
                        <span><OmarchyIcon name={previewWindow.icon} size={13} />{previewWindow.app}</span>
                      {/each}
                    </span>
                    <OmarchyIcon name="arrowRight" size={15} />
                  </button>
                {/each}
              </div>
              <footer><span>Alt 1–5 to switch</span><span>Ctrl Space to launch</span><span>Esc to close</span></footer>
            </section>
          {/if}

          {#if launchedApp && monitorIndex === 0}
            <div class="launch-toast" role="status"><OmarchyIcon name="check" size={14} /><span><strong>{launchedApp}</strong> opened in {workspaceNames[workspace]}</span><button type="button" aria-label="Dismiss launch notification" onclick={() => (launchedApp = null)}><OmarchyIcon name="close" size={12} /></button></div>
          {/if}

          <div class="shell-safety-note">Studio simulation · no native shell connection</div>
        </div>
      </article>
    {/each}
  </div>
</section>

<style>
  .shell-experience {
    --shell-font: "Segoe UI Variable", "Segoe UI", sans-serif;
    width: 100%;
    color: var(--shell-foreground);
    font-family: var(--shell-font);
    font-size: 12px;
  }

  button,
  input {
    font: inherit;
  }

  button {
    color: inherit;
  }

  button:focus-visible,
  input:focus-visible {
    outline: 2px solid var(--shell-foreground);
    outline-offset: 2px;
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
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 16%, transparent);
    border-radius: 10px;
    background: var(--shell-background);
    box-shadow: 0 22px 70px rgba(0, 0, 0, 0.48);
  }

  .desktop {
    position: relative;
    min-height: 640px;
    overflow: hidden;
    background-color: var(--shell-background);
    background-image: var(--shell-wallpaper);
    background-position: center;
    background-size: cover;
    isolation: isolate;
  }

  .multi-monitor .desktop {
    min-height: 440px;
  }

  .desktop::before {
    position: absolute;
    z-index: -1;
    inset: 0;
    background: color-mix(in srgb, var(--shell-background) 26%, transparent);
    content: "";
  }

  .top-bar {
    position: absolute;
    z-index: 30;
    top: 0;
    right: 0;
    left: 0;
    display: grid;
    height: 20px;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 0 4px;
    border: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--shell-foreground) 9%, transparent);
    border-radius: 0;
    background: color-mix(in srgb, var(--shell-darker-background) 89%, transparent);
    box-shadow: 0 5px 18px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(14px) saturate(1.08);
  }

  .bar-zone,
  .bar-center,
  .workspaces,
  .system-cluster,
  .weather {
    display: flex;
    align-items: center;
  }

  .bar-zone {
    min-width: 0;
    gap: 2px;
  }

  .bar-right {
    justify-content: flex-end;
  }

  .bar-center {
    height: 100%;
    gap: 6px;
    color: var(--shell-light-foreground);
  }

  .bar-button,
  .system-cluster,
  .clock-button,
  .workspaces button {
    min-width: 19px;
    min-height: 18px;
    height: 18px;
    border: 0;
    border-radius: 3px;
    background: transparent;
    align-self: center;
    box-sizing: border-box;
    cursor: pointer;
    line-height: 1;
  }

  .bar-button {
    position: relative;
    display: grid;
    padding: 0;
    place-items: center;
  }

  .bar-button :global(svg),
  .system-cluster :global(svg) {
    width: 11px;
    height: 11px;
  }

  .brand-button :global(svg) {
    width: 12px;
    height: 12px;
  }

  .top-bar :global(.omarchy-icon) {
    align-self: center;
    justify-self: center;
    vertical-align: middle;
  }

  .brand-button {
    color: var(--shell-foreground);
  }

  .bar-button:hover,
  .bar-button.active,
  .system-cluster:hover,
  .system-cluster.active,
  .clock-button:hover,
  .clock-button.active {
    background: var(--shell-lighter-background);
  }

  .top-bar button:focus-visible {
    outline: 1px solid color-mix(in srgb, var(--shell-foreground) 72%, transparent);
    outline-offset: -1px;
  }

  .workspaces {
    gap: 1px;
  }

  .workspaces button {
    position: relative;
    display: grid;
    width: 19px;
    padding: 0;
    color: var(--shell-dark-foreground);
    font-size: 9px;
    cursor: pointer;
    place-items: center;
  }

  .workspaces button::after {
    position: absolute;
    right: 6px;
    bottom: 1px;
    left: 6px;
    height: 1px;
    border-radius: 1px;
    background: transparent;
    content: "";
    transition: right 180ms cubic-bezier(0.23, 1, 0.32, 1), left 180ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .workspaces button:hover {
    color: var(--shell-light-foreground);
  }

  .workspaces button.active {
    color: var(--shell-foreground);
    background: var(--shell-lighter-background);
  }

  .workspaces button.active::after {
    right: 5px;
    left: 5px;
    background: var(--shell-foreground);
  }

  .clock-button {
    display: flex;
    min-width: 91px;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 0 4px;
  }

  .clock-button span {
    color: var(--shell-dark-foreground);
    font-size: 9px;
  }

  .clock-button strong {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .bar-separator {
    width: 1px;
    height: 9px;
    background: color-mix(in srgb, var(--shell-foreground) 12%, transparent);
  }

  .weather {
    gap: 3px;
    color: var(--shell-dark-foreground);
    font-size: 9px;
  }

  .system-cluster {
    width: auto;
    gap: 4px;
    padding: 0 4px;
    color: var(--shell-light-foreground);
    font-size: 8px;
  }

  .notification-dot {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--shell-foreground);
  }

  .desktop-content {
    position: absolute;
    inset: 25px 5px 5px;
  }

  .workspace-meta {
    position: absolute;
    z-index: 0;
    right: 14px;
    bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: color-mix(in srgb, var(--shell-foreground) 24%, transparent);
  }

  .workspace-meta > span {
    font-size: 31px;
    font-weight: 200;
    letter-spacing: -0.08em;
  }

  .workspace-meta div {
    display: grid;
  }

  .workspace-meta strong {
    color: color-mix(in srgb, var(--shell-foreground) 34%, transparent);
    font-size: 10px;
    font-weight: 600;
  }

  .workspace-meta small {
    font-size: 8px;
    text-transform: capitalize;
  }

  .window-layout {
    display: grid;
    height: 100%;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: repeat(12, minmax(0, 1fr));
    gap: 6px;
    transition: opacity 160ms ease-out, transform 220ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .app-window {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 13%, transparent);
    border-radius: 5px;
    background: color-mix(in srgb, var(--shell-dark-background) 96%, transparent);
    box-shadow: 0 14px 35px rgba(0, 0, 0, 0.28);
    transition: grid-area 220ms cubic-bezier(0.23, 1, 0.32, 1), opacity 160ms ease-out, transform 220ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .app-window[data-index="0"] {
    grid-area: 1 / 1 / 13 / 8;
  }

  .app-window[data-index="1"] {
    grid-area: 1 / 8 / 7 / 13;
  }

  .app-window[data-index="2"] {
    grid-area: 7 / 8 / 13 / 13;
  }

  [data-layout="master"] .app-window[data-index="0"] {
    grid-area: 1 / 1 / 13 / 9;
  }

  [data-layout="master"] .app-window[data-index="1"] {
    grid-area: 1 / 9 / 7 / 13;
  }

  [data-layout="master"] .app-window[data-index="2"] {
    grid-area: 7 / 9 / 13 / 13;
  }

  [data-layout="columns"] .app-window[data-index="0"] {
    grid-area: 1 / 1 / 13 / 5;
  }

  [data-layout="columns"] .app-window[data-index="1"] {
    grid-area: 1 / 5 / 13 / 9;
  }

  [data-layout="columns"] .app-window[data-index="2"] {
    grid-area: 1 / 9 / 13 / 13;
  }

  [data-layout="monocle"] .app-window[data-index="0"] {
    grid-area: 1 / 1 / 13 / 13;
  }

  [data-layout="monocle"] .app-window:not([data-index="0"]) {
    display: none;
  }

  .app-window:first-child {
    border-color: color-mix(in srgb, var(--shell-accent) 74%, var(--shell-foreground));
  }

  .window-titlebar {
    display: flex;
    height: 25px;
    align-items: center;
    justify-content: space-between;
    padding: 0 7px;
    border-bottom: 1px solid color-mix(in srgb, var(--shell-foreground) 9%, transparent);
    background: color-mix(in srgb, var(--shell-lighter-background) 68%, transparent);
  }

  .app-identity,
  .window-actions {
    display: flex;
    align-items: center;
  }

  .app-identity {
    min-width: 0;
    gap: 6px;
    overflow: hidden;
    color: var(--shell-light-foreground);
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .window-actions {
    gap: 8px;
    color: var(--shell-dark-foreground);
  }

  .window-body {
    height: calc(100% - 25px);
    overflow: hidden;
  }

  .terminal-view {
    height: 100%;
    padding: 18px;
    color: var(--shell-light-foreground);
    background: color-mix(in srgb, var(--shell-darker-background) 97%, transparent);
    font: 9px/1.7 "Cascadia Code", "SFMono-Regular", Consolas, monospace;
  }

  .terminal-view p {
    margin: 0;
  }

  .terminal-view p span,
  .terminal-success {
    color: var(--shell-green);
  }

  .terminal-view em {
    color: var(--shell-accent);
    font-style: normal;
  }

  .terminal-rule {
    color: var(--shell-dark-foreground);
  }

  .command-line {
    margin-top: 13px !important;
    color: var(--shell-foreground);
  }

  .terminal-cursor {
    display: inline-block;
    width: 5px;
    height: 10px;
    background: var(--shell-foreground);
    animation: cursor-blink 1.1s steps(1) infinite;
  }

  .code-view {
    display: grid;
    height: 100%;
    grid-template-columns: 24px 1fr;
    background: var(--shell-darker-background);
  }

  .code-view > aside {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 13px;
    padding-top: 10px;
    border-right: 1px solid color-mix(in srgb, var(--shell-foreground) 8%, transparent);
    color: var(--shell-dark-foreground);
  }

  .editor-tab {
    display: flex;
    width: max-content;
    height: 24px;
    align-items: center;
    gap: 5px;
    padding: 0 9px;
    border-bottom: 1px solid var(--shell-accent);
    color: var(--shell-light-foreground);
    background: var(--shell-dark-background);
    font-size: 8px;
  }

  .editor ol {
    margin: 0;
    padding: 15px 18px 15px 36px;
    color: var(--shell-dark-foreground);
    font: 9px/1.7 "Cascadia Code", Consolas, monospace;
  }

  .editor li {
    padding-left: 8px;
    color: var(--shell-light-foreground);
  }

  .editor li::marker,
  .syntax-dim {
    color: var(--shell-dark-foreground);
  }

  .syntax-key {
    color: var(--shell-accent);
  }

  .syntax-value {
    color: var(--shell-green);
  }

  .browser-view {
    height: 100%;
    color: var(--shell-light-foreground);
    background: var(--shell-background);
  }

  .browser-toolbar {
    display: flex;
    height: 25px;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
    border-bottom: 1px solid color-mix(in srgb, var(--shell-foreground) 9%, transparent);
    color: var(--shell-dark-foreground);
    font-size: 8px;
  }

  .address {
    display: flex;
    min-width: 0;
    height: 17px;
    flex: 1;
    align-items: center;
    gap: 5px;
    overflow: hidden;
    padding: 0 7px;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 8%, transparent);
    border-radius: 4px;
    background: var(--shell-dark-background);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .repository-view {
    display: grid;
    grid-template-columns: 34px 1fr auto;
    align-items: center;
    gap: 9px;
    padding: 14px 16px 10px;
  }

  .repo-mark {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 15%, transparent);
    border-radius: 6px;
    color: var(--shell-foreground);
    background: var(--shell-lighter-background);
  }

  .repository-view small,
  .repository-view p {
    color: var(--shell-dark-foreground);
    font-size: 8px;
  }

  .repository-view h3,
  .repository-view p {
    margin: 0;
  }

  .repository-view h3 {
    font-size: 13px;
    font-weight: 600;
  }

  .repo-branch {
    padding: 3px 7px;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 12%, transparent);
    border-radius: 4px;
    color: var(--shell-light-foreground);
    font-size: 8px;
  }

  .repo-list {
    display: grid;
    margin: 0 16px;
    border-top: 1px solid color-mix(in srgb, var(--shell-foreground) 9%, transparent);
  }

  .repo-list span {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 4px;
    border-bottom: 1px solid color-mix(in srgb, var(--shell-foreground) 7%, transparent);
    font-size: 8px;
  }

  .repo-list small {
    overflow: hidden;
    color: var(--shell-dark-foreground);
    font-size: 7px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .files-view {
    display: grid;
    height: 100%;
    grid-template-columns: 30% 1fr;
    background: var(--shell-background);
  }

  .files-view aside {
    display: grid;
    align-content: start;
    gap: 8px;
    padding: 12px 9px;
    border-right: 1px solid color-mix(in srgb, var(--shell-foreground) 8%, transparent);
    color: var(--shell-dark-foreground);
    font-size: 8px;
  }

  .files-view aside p {
    margin: 0 0 4px;
    color: var(--shell-light-foreground);
    font-weight: 600;
  }

  .files-view aside span,
  .file-grid div {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .file-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
    gap: 7px;
    padding: 14px;
  }

  .file-grid div {
    overflow: hidden;
    flex-direction: column;
    padding: 9px 5px;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 8%, transparent);
    border-radius: 4px;
    color: var(--shell-light-foreground);
    font-size: 7px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .music-view {
    display: grid;
    height: 100%;
    grid-template-columns: minmax(70px, 34%) 1fr;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: var(--shell-dark-background);
  }

  .album-art {
    display: grid;
    aspect-ratio: 1;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 13%, transparent);
    border-radius: 5px;
    color: var(--shell-accent);
    background: var(--shell-lighter-background);
  }

  .music-view small,
  .music-view p {
    color: var(--shell-dark-foreground);
    font-size: 8px;
  }

  .music-view h3,
  .music-view p {
    margin: 2px 0;
  }

  .track {
    height: 2px;
    margin-top: 10px;
    background: var(--shell-muted);
  }

  .track span {
    display: block;
    width: 61%;
    height: 100%;
    background: var(--shell-foreground);
  }

  .notes-view {
    height: 100%;
    padding: 18px;
    color: var(--shell-light-foreground);
    background: var(--shell-dark-background);
  }

  .notes-view h3 {
    margin: 6px 0 12px;
    font-size: 14px;
  }

  .note-date {
    margin: 0;
    color: var(--shell-dark-foreground);
    font-size: 8px;
  }

  .notes-view ul {
    display: grid;
    gap: 8px;
    margin: 0;
    padding-left: 16px;
    color: var(--shell-dark-foreground);
    font-size: 9px;
  }

  .panel-scrim {
    position: absolute;
    z-index: 35;
    inset: 0;
    width: auto;
    height: auto;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: rgba(0, 0, 0, 0.24);
    cursor: default;
  }

  .shell-panel,
  .overview-panel {
    position: absolute;
    z-index: 40;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 14%, transparent);
    border-radius: 8px;
    background: color-mix(in srgb, var(--shell-darker-background) 94%, transparent);
    box-shadow: 0 28px 80px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(28px) saturate(1.08);
    animation: panel-enter 180ms cubic-bezier(0.23, 1, 0.32, 1) both;
  }

  .launcher-panel {
    top: 26px;
    left: 5px;
    width: min(430px, calc(100% - 16px));
    padding: 10px;
  }

  .launcher-search {
    display: grid;
    height: 38px;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 9px;
    padding: 0 10px;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 14%, transparent);
    border-radius: 6px;
    background: var(--shell-dark-background);
  }

  .launcher-search input {
    min-width: 0;
    border: 0;
    outline: 0;
    color: var(--shell-foreground);
    background: transparent;
    font-size: 11px;
  }

  .launcher-search input::placeholder {
    color: var(--shell-dark-foreground);
  }

  kbd {
    padding: 2px 5px;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 13%, transparent);
    border-radius: 3px;
    color: var(--shell-dark-foreground);
    background: var(--shell-lighter-background);
    font: 7px var(--shell-font);
  }

  .launcher-context {
    display: flex;
    gap: 14px;
    padding: 10px 4px 7px;
    color: var(--shell-dark-foreground);
    font-size: 8px;
  }

  .launcher-context span:first-child {
    color: var(--shell-foreground);
  }

  .app-grid {
    display: grid;
    gap: 3px;
  }

  .app-grid button {
    display: grid;
    min-height: 42px;
    grid-template-columns: 32px 1fr auto;
    align-items: center;
    gap: 8px;
    padding: 4px 7px;
    border: 0;
    border-radius: 5px;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .app-grid button:hover,
  .app-grid button:focus-visible {
    background: var(--shell-lighter-background);
  }

  .app-icon,
  .notification-icon,
  .user-avatar {
    display: grid;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 12%, transparent);
    border-radius: 5px;
    color: var(--shell-light-foreground);
    background: var(--shell-lighter-background);
  }

  .app-icon {
    width: 30px;
    height: 30px;
  }

  .app-grid button > span:nth-child(2),
  .quick-toggles button span,
  .quick-settings-panel header div,
  .weather-large span {
    display: grid;
  }

  .app-grid strong {
    font-size: 10px;
    font-weight: 600;
  }

  .app-grid small,
  .quick-settings-panel small,
  .weather-large small {
    color: var(--shell-dark-foreground);
    font-size: 8px;
  }

  .launcher-panel > footer,
  .overview-panel > footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 4px 0;
    color: var(--shell-dark-foreground);
    font-size: 8px;
  }

  .launcher-panel > footer span:first-child {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .calendar-panel {
    top: 26px;
    left: 50%;
    width: min(470px, calc(100% - 16px));
    padding: 16px;
    transform: translateX(-50%);
    transform-origin: top center;
  }

  .calendar-panel > header,
  .quick-settings-panel > header,
  .notifications-panel > header,
  .overview-panel > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .calendar-panel p,
  .calendar-panel h2,
  .notifications-panel p,
  .notifications-panel h2,
  .overview-panel p,
  .overview-panel h2 {
    margin: 0;
  }

  .calendar-panel header p,
  .notifications-panel header p,
  .overview-panel header p {
    color: var(--shell-dark-foreground);
    font-size: 8px;
    text-transform: uppercase;
  }

  .calendar-panel h2,
  .notifications-panel h2,
  .overview-panel h2 {
    font-size: 15px;
    font-weight: 550;
  }

  .weather-large {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .weather-large strong {
    font-size: 13px;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 3px;
    margin-top: 16px;
  }

  .calendar-grid strong,
  .calendar-grid button {
    display: grid;
    height: 26px;
    place-items: center;
    border: 0;
    border-radius: 4px;
    background: transparent;
    font-size: 8px;
  }

  .calendar-grid strong {
    color: var(--shell-dark-foreground);
    font-weight: 500;
  }

  .calendar-grid button:hover {
    background: var(--shell-lighter-background);
  }

  .calendar-grid button.today {
    color: var(--shell-background);
    background: var(--shell-foreground);
    font-weight: 700;
  }

  .agenda {
    display: grid;
    gap: 5px;
    margin-top: 13px;
    padding-top: 11px;
    border-top: 1px solid color-mix(in srgb, var(--shell-foreground) 10%, transparent);
  }

  .agenda > div {
    display: grid;
    grid-template-columns: 44px 1fr;
    align-items: center;
    padding: 5px 7px;
    border-radius: 4px;
    background: var(--shell-dark-background);
  }

  .agenda time,
  .agenda small {
    color: var(--shell-dark-foreground);
    font-size: 8px;
  }

  .agenda span {
    display: grid;
  }

  .agenda strong {
    font-size: 9px;
    font-weight: 550;
  }

  .quick-settings-panel,
  .notifications-panel {
    top: 26px;
    right: 5px;
    width: min(335px, calc(100% - 16px));
    padding: 13px;
  }

  .quick-settings-panel > header {
    display: grid;
    grid-template-columns: 32px 1fr 28px;
    gap: 8px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
  }

  .quick-settings-panel > header button,
  .notifications-panel > header button {
    display: grid;
    height: 28px;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 10%, transparent);
    border-radius: 5px;
    background: var(--shell-lighter-background);
    cursor: pointer;
  }

  .quick-toggles {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    margin-top: 13px;
  }

  .quick-toggles button {
    display: grid;
    min-height: 46px;
    grid-template-columns: 24px 1fr;
    align-items: center;
    gap: 5px;
    padding: 6px 7px;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 10%, transparent);
    border-radius: 5px;
    background: var(--shell-dark-background);
    text-align: left;
    cursor: pointer;
  }

  .quick-toggles button.enabled {
    border-color: color-mix(in srgb, var(--shell-accent) 70%, var(--shell-foreground));
    background: var(--shell-lighter-background);
  }

  .quick-toggles strong {
    font-size: 8px;
    font-weight: 550;
  }

  .slider-row {
    display: grid;
    min-height: 34px;
    grid-template-columns: 18px 48px 1fr 30px;
    align-items: center;
    gap: 5px;
    margin-top: 7px;
    color: var(--shell-light-foreground);
    font-size: 8px;
  }

  .slider-row input {
    width: 100%;
    accent-color: var(--shell-foreground);
  }

  .slider-row output {
    color: var(--shell-dark-foreground);
    text-align: right;
  }

  .system-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    margin-top: 8px;
    padding: 9px 0;
    border-top: 1px solid color-mix(in srgb, var(--shell-foreground) 9%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--shell-foreground) 9%, transparent);
  }

  .system-metrics span {
    display: flex;
    align-items: center;
    gap: 3px;
    color: var(--shell-dark-foreground);
    font-size: 7px;
  }

  .system-metrics strong {
    color: var(--shell-light-foreground);
    font-weight: 500;
  }

  .quick-settings-panel > footer {
    display: flex;
    gap: 5px;
    padding-top: 9px;
  }

  .quick-settings-panel > footer button {
    display: flex;
    height: 28px;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: 5px;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 10%, transparent);
    border-radius: 5px;
    background: var(--shell-dark-background);
    font-size: 8px;
    cursor: pointer;
  }

  .notifications-panel > header button {
    width: auto;
    padding: 0 8px;
    color: var(--shell-dark-foreground);
    font-size: 8px;
  }

  .notifications-panel article {
    display: grid;
    grid-template-columns: 30px 1fr;
    gap: 8px;
    margin-top: 7px;
    padding: 9px;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 9%, transparent);
    border-radius: 5px;
    background: var(--shell-dark-background);
  }

  .notification-icon {
    width: 30px;
    height: 30px;
  }

  .notifications-panel article strong {
    font-size: 9px;
    font-weight: 550;
  }

  .notifications-panel article p {
    margin: 2px 0;
    color: var(--shell-light-foreground);
    font-size: 8px;
  }

  .notifications-panel article time {
    color: var(--shell-dark-foreground);
    font-size: 7px;
  }

  .notifications-panel > footer {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 10px 2px 0;
    color: var(--shell-dark-foreground);
    font-size: 8px;
  }

  .overview-panel {
    top: 30px;
    right: 6%;
    left: 6%;
    padding: 17px;
  }

  .layout-switcher {
    display: flex;
    gap: 3px;
    padding: 3px;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 10%, transparent);
    border-radius: 5px;
    background: var(--shell-dark-background);
  }

  .layout-switcher button {
    height: 23px;
    padding: 0 7px;
    border: 0;
    border-radius: 3px;
    color: var(--shell-dark-foreground);
    background: transparent;
    font-size: 8px;
    text-transform: capitalize;
    cursor: pointer;
  }

  .layout-switcher button.active {
    color: var(--shell-foreground);
    background: var(--shell-lighter-background);
  }

  .overview-grid {
    display: grid;
    gap: 5px;
    margin-top: 14px;
  }

  .overview-grid > button {
    display: grid;
    min-height: 50px;
    grid-template-columns: 34px 100px 1fr 20px;
    align-items: center;
    gap: 8px;
    padding: 6px 9px;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 9%, transparent);
    border-radius: 5px;
    background: var(--shell-dark-background);
    text-align: left;
    cursor: pointer;
  }

  .overview-grid > button:hover,
  .overview-grid > button.active {
    border-color: color-mix(in srgb, var(--shell-accent) 70%, var(--shell-foreground));
    background: var(--shell-lighter-background);
  }

  .overview-number {
    color: var(--shell-dark-foreground);
    font-size: 15px;
    font-weight: 250;
  }

  .overview-title {
    display: grid;
  }

  .overview-title strong {
    font-size: 9px;
    font-weight: 550;
  }

  .overview-title small {
    color: var(--shell-dark-foreground);
    font-size: 7px;
  }

  .overview-apps {
    display: flex;
    gap: 4px;
  }

  .overview-apps > span {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 8%, transparent);
    border-radius: 4px;
    color: var(--shell-dark-foreground);
    background: color-mix(in srgb, var(--shell-darker-background) 70%, transparent);
    font-size: 7px;
  }

  .launch-toast {
    position: absolute;
    z-index: 50;
    right: 14px;
    bottom: 14px;
    display: grid;
    min-width: 220px;
    min-height: 40px;
    grid-template-columns: 20px 1fr 24px;
    align-items: center;
    gap: 7px;
    padding: 6px 7px;
    border: 1px solid color-mix(in srgb, var(--shell-foreground) 14%, transparent);
    border-radius: 6px;
    background: color-mix(in srgb, var(--shell-darker-background) 94%, transparent);
    box-shadow: 0 16px 45px rgba(0, 0, 0, 0.42);
    backdrop-filter: blur(20px);
    animation: toast-enter 180ms cubic-bezier(0.23, 1, 0.32, 1) both;
    font-size: 8px;
  }

  .launch-toast button {
    display: grid;
    height: 22px;
    place-items: center;
    border: 0;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
  }

  .shell-safety-note {
    position: absolute;
    z-index: 5;
    bottom: 4px;
    left: 10px;
    color: color-mix(in srgb, var(--shell-foreground) 28%, transparent);
    font-size: 7px;
    letter-spacing: 0.03em;
  }

  @keyframes panel-enter {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.985);
    }
  }

  @keyframes toast-enter {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }

  @keyframes cursor-blink {
    50% {
      opacity: 0;
    }
  }

  .reduced-motion *,
  .reduced-motion *::before,
  .reduced-motion *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }

  @media (max-width: 900px) {
    .weather,
    .clock-button span,
    .system-cluster span,
    .workspace-meta,
    .overview-apps {
      display: none;
    }

    .clock-button {
      min-width: 54px;
    }

    .overview-grid > button {
      grid-template-columns: 28px 1fr 18px;
    }
  }
</style>
