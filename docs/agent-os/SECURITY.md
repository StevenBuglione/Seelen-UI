# Agent OS host security boundary

M00 authorizes repository, documentation, build, and static verification work only. It does not authorize execution of
the current Seelen startup path.

Forbidden on the developer's active Windows session:

- installing or launching Seelen in development or production mode;
- starting, stopping, registering, or modifying the Seelen service;
- creating or changing Seelen scheduled tasks or autostart;
- hiding or altering the Windows taskbar, notification center, or shell reservations;
- registering global event hooks, keyboard capture, shortcuts, or AppBars;
- running installer, updater, wallpaper, focus, network, power, or brightness mutations.

The current production startup path reaches several of these operations. See
[`M00_STARTUP_SIDE_EFFECT_INVENTORY.md`](M00_STARTUP_SIDE_EFFECT_INVENTORY.md).

M01 makes them structurally unreachable from Harness Mode:

- startup arguments are parsed before logger, CLI forwarding, production IPC, or data-path access;
- only Production and dual-authorized Integration bootstraps can construct `ShellEffectCapability`;
- `RealShellAdapter` requires that sealed capability;
- Harness injects only `FixtureShellAdapter` and registers no plugins or invoke handler;
- the Harness Tauri overlay uses a distinct identifier, data/cache namespace, WebView2 directory, and reserved pipe
  names;
- a production-context binary refuses Harness Mode before Tauri application construction;
- the source-policy test rejects known production side-effect entry points in `agent_os/harness.rs`;
- the native verification script compares protected host state before and after every Harness smoke.

Integration and Production remain forbidden on the active developer session. The two Integration authorization signals
are defense in depth; they do not make a non-disposable environment acceptable.
