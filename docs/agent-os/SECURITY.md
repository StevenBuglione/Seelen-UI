# Agent OS M00 security boundary

M00 authorizes repository, documentation, build, and static verification work only. It does not authorize execution of
the current Seelen startup path.

Forbidden on the developer's active Windows session:

- installing or launching Seelen in development or production mode;
- starting, stopping, registering, or modifying the Seelen service;
- creating or changing Seelen scheduled tasks or autostart;
- hiding or altering the Windows taskbar, notification center, or shell reservations;
- registering global event hooks, keyboard capture, shortcuts, or AppBars;
- running installer, updater, wallpaper, focus, network, power, or brightness mutations.

The current upstream startup path reaches several of these operations. See
[`M00_STARTUP_SIDE_EFFECT_INVENTORY.md`](M00_STARTUP_SIDE_EFFECT_INVENTORY.md). M01 must make those effects structurally
unreachable from Harness Mode through a capability-based bootstrap boundary.
