# ADR 0007: Shell-first Omarchy experience before Agent OS surfaces

- Status: accepted for revised M02 candidate review
- Date: 2026-08-27

## Decision

Use the main `basecamp/omarchy` repository, not an individual pull request, as the complete shell experience reference.
Pin its default `quattro` branch at `83881e979b35468c3e7d60b171e319ede61a88fd` and adapt its bar, workspace, tiling,
launcher, contextual-panel, theme, wallpaper, keyboard, and motion grammar into Agent OS.

Establish and approve the shell experience before adding visible Agent OS features. The revised M02 Studio defaults to
the shell experience and contains no Agent OS assistant surface. Existing Agent fixtures remain isolated as acceptance
infrastructure in a deferred mode.

Only declarative, reviewed, licensed inputs may cross the compatibility boundary. Omarchy QML, Hyprland Lua, shell
scripts, Linux services, hooks, installers, autostart, and IPC are not imported or evaluated.

## Consequences

- M02 remains browser-only and changes no production shell behavior.
- The visual target is source-grounded rather than generated from a loose style description.
- Seelen remains the Windows implementation substrate for workspaces, tiling, toolbar widgets, popups, resources, and
  typed native behavior.
- All later Agent surfaces must feel native to the approved shell and remain absent until the shell baseline passes
  human visual review.
- The written M03 presentation sequence now requires an explicit reconciliation with this user-approved shell-first
  direction; M03 is not started by this ADR.
