# Omarchy shell experience compatibility contract

## Purpose

The approved visual target is a complete Omarchy-like shell experience before Agent OS surfaces are layered on top. M02
implements that target only as a browser-only Shell Studio contract. It does not change, start, install, or configure
the production Windows shell.

The authoritative reference is `basecamp/omarchy` on its default `quattro` branch at
`83881e979b35468c3e7d60b171e319ede61a88fd`. Exact source hashes and the copied asset hash are recorded in
[`upstream/omarchy.lock.json`](upstream/omarchy.lock.json).

## Experience mapping

| Omarchy experience                              | M02 Studio contract                                                                           | Intended Seelen-native implementation after approval                |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Single compact bar with left/center/right zones | Menu and workspaces left, exact clock/weather center, status and overview right               | Fancy toolbar layout and typed toolbar plugins                      |
| Keyboard-led application launcher               | Searchable launcher with applications, commands, shortcut hints, and launch feedback          | Seelen apps menu/launcher with configured shortcuts                 |
| Hyprland workspaces                             | Five named, keyboard-addressable workspace fixtures                                           | Seelen virtual workspaces and workspace viewer                      |
| Dwindle and alternate layouts                   | Dwindle, master, columns, and monocle deterministic layouts                                   | Declarative Seelen WM layout plugins                                |
| Contextual shell panels                         | Launcher, calendar, quick settings, notifications, and workspace overview                     | Existing Seelen popup/flyout/widget surfaces with shared tokens     |
| Theme-wide declarative palettes                 | All 22 `colors.toml` palettes normalized to semantic CSS variables                            | Generated Seelen theme resources and shared shell tokens            |
| Theme wallpaper                                 | Pinned Vantablack `2-layers-deep.webp` source asset                                           | Seelen wallpaper manager/resource                                   |
| Calm motion                                     | Omarchy `easeOutQuint`-shaped entrance and workspace transitions with reduced-motion override | Shared Svelte motion tokens and Seelen performance-mode integration |

## Non-portable implementation boundary

Omarchy is an Arch Linux and Hyprland configuration; Seelen is a Windows shell. Compatibility is architectural and
visual, not binary:

- do not evaluate Omarchy QML, Lua, shell scripts, installers, or hooks;
- do not connect to Wayland, Hyprland, D-Bus, or Quickshell IPC;
- do not copy Linux service, package, keybinding, autostart, or system configuration;
- translate only reviewed declarative palettes, bar composition, spacing, panel geometry, motion intent, and licensed
  assets into Svelte/Seelen contracts;
- keep Windows behavior behind Seelen's typed commands, events, resource system, and existing safety boundaries;
- map tiling intent to declarative Seelen layout plugins rather than translating or running Hyprland Lua;
- preserve high contrast, reduced motion, keyboard navigation, and explicit focus states.

## Shell-first layering rule

The default Shell Studio route renders the shell experience with no Agent OS orb, capsule, sheet, stage, sidecar, or
assistant panel. The 26 M02 Agent fixtures remain available only in the explicitly labeled deferred fixture mode so the
deterministic adapter and acceptance evidence are preserved.

No production Agent surface or production shell resource is authorized by this decision. After the shell baseline is
approved by a human, the handoff milestone sequence must be reconciled with the user's shell-first direction before M03
begins. Agent features must adopt the approved shell tokens and contextual-surface grammar rather than visually
competing with the desktop.

## M02 review surface

Shell Studio exposes deterministic states for:

- the Vantablack desktop;
- the application launcher;
- calendar and agenda;
- quick settings;
- notifications;
- workspace overview;
- all five workspaces;
- four window layouts;
- all 22 pinned palettes;
- normal and reduced motion;
- one- and two-monitor canvases.

Every top-bar control opens its corresponding panel, Escape dismisses panels, workspace controls switch fixtures, the
launcher filters and returns launch feedback, and the Studio continues to state that no native shell connection exists.
