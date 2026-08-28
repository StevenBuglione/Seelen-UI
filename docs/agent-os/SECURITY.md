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

M02 adds a separate browser-only boundary:

- `just studio` resolves only to Vite and cannot compile or launch Rust/Tauri;
- shared Agent OS components depend on the TypeScript `ShellAdapter` port, with only `FixtureShellAdapter` implemented
  in M02;
- a source-policy unit test rejects Tauri/native bridge entry points from the shared UI and Studio source trees;
- fixture state, fake time, identifiers, random values, network latency, and `.aostrace` replay are deterministic;
- Studio binds its development server to `127.0.0.1` and exposes no native command bridge;
- CI compares committed Windows visual and ARIA baselines but has no snapshot-update command.

The Studio is a preview/test process, not a trust boundary for untrusted external content. M02 adds no network client,
file mutation port, shell command, updater, installer, or production process connection.

M03 preserves that boundary. Its tokens, focus trap, components, presentation mapper, top-bar Orb, and contextual
surfaces live entirely in the shared browser package. The preview's `Ctrl+Shift+Space` invocation is an ordinary page
keyboard listener that operates only while the Studio page has focus. M03 registers no global shortcut, keyboard hook,
native widget, Tauri command, named-pipe client, service, AppBar, autostart entry, installer, or production shell path.
