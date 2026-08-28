#[test]
fn harness_bootstrap_has_no_production_side_effect_entry_points() {
    let source = include_str!("harness.rs");
    let forbidden = [
        "SEELEN_COMMON",
        "ServicePipe",
        "SelfPipe",
        "SeelenUI",
        "register_plugins",
        "register_invoke_handler",
        "register_win_hook",
        "create_background_window",
        "WIDGET_MANAGER",
        "tauri_plugin_",
        "check_for_updates",
        "register_app_bar",
        "set_auto_start",
        "slu_ipc",
        "WindowsApi",
    ];

    for entry_point in forbidden {
        assert!(
            !source.contains(entry_point),
            "Harness bootstrap reached forbidden production entry point {entry_point}"
        );
    }
}
