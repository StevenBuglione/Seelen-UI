#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RuntimeNamespace {
    pub application_identifier: &'static str,
    pub data_directory_name: &'static str,
    pub cache_directory_name: &'static str,
    pub webview_data_directory_name: &'static str,
    app_pipe_stem: &'static str,
    service_pipe_stem: &'static str,
}

impl RuntimeNamespace {
    pub const PRODUCTION: Self = Self {
        application_identifier: "com.seelen.seelen-ui",
        data_directory_name: "com.seelen.seelen-ui",
        cache_directory_name: "com.seelen.seelen-ui",
        webview_data_directory_name: "seelen-ui",
        app_pipe_stem: "seelen-ui",
        service_pipe_stem: "seelen-ui-service",
    };

    pub const HARNESS: Self = Self {
        application_identifier: "com.agent-os.shell-harness",
        data_directory_name: "com.agent-os.shell-harness",
        cache_directory_name: "com.agent-os.shell-harness",
        webview_data_directory_name: "agent-os-shell-harness-webview2",
        app_pipe_stem: "agent-os-shell-harness",
        service_pipe_stem: "agent-os-shell-harness-service",
    };

    pub fn app_pipe_path(self, session_id: u32) -> String {
        format!(r"\\.\pipe\{}-{session_id}", self.app_pipe_stem)
    }

    pub fn service_pipe_path(self, session_id: u32) -> String {
        format!(r"\\.\pipe\{}-{session_id}", self.service_pipe_stem)
    }
}

impl Default for RuntimeNamespace {
    fn default() -> Self {
        Self::HARNESS
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn harness_namespace_never_collides_with_production() {
        let production = RuntimeNamespace::PRODUCTION;
        let harness = RuntimeNamespace::HARNESS;

        assert_ne!(
            harness.application_identifier,
            production.application_identifier
        );
        assert_ne!(harness.data_directory_name, production.data_directory_name);
        assert_ne!(
            harness.cache_directory_name,
            production.cache_directory_name
        );
        assert_ne!(
            harness.webview_data_directory_name,
            production.webview_data_directory_name
        );
        assert_ne!(harness.app_pipe_path(7), production.app_pipe_path(7));
        assert_ne!(
            harness.service_pipe_path(7),
            production.service_pipe_path(7)
        );
    }

    #[test]
    fn production_pipe_contract_matches_the_unchanged_slu_ipc_names() {
        assert_eq!(
            RuntimeNamespace::PRODUCTION.app_pipe_path(42),
            r"\\.\pipe\seelen-ui-42"
        );
        assert_eq!(
            RuntimeNamespace::PRODUCTION.service_pipe_path(42),
            r"\\.\pipe\seelen-ui-service-42"
        );
    }

    #[test]
    fn harness_tauri_config_uses_the_reserved_namespace_and_no_plugins() {
        let config: serde_json::Value =
            serde_json::from_str(include_str!("../../tauri.harness.conf.json"))
                .expect("harness Tauri overlay should be valid JSON");
        assert_eq!(
            config["identifier"],
            RuntimeNamespace::HARNESS.application_identifier
        );
        assert_eq!(
            config["app"]["windows"][0]["dataDirectory"],
            RuntimeNamespace::HARNESS.webview_data_directory_name
        );
        assert_eq!(config["bundle"]["active"], false);
        assert!(config["plugins"]["updater"].is_null());
        assert!(config["plugins"]["deep-link"].is_null());
        assert!(config["build"]["beforeDevCommand"].is_null());
        assert!(config["build"]["beforeBuildCommand"].is_null());
        assert!(config["build"]["devUrl"].is_null());
        assert_eq!(
            config["app"]["security"]["assetProtocol"]["scope"],
            serde_json::json!(["harness/**/*"])
        );
    }
}
