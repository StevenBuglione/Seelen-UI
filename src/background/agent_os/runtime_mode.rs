use std::{ffi::OsString, fmt};

use clap::{Parser, ValueEnum};

const DISPOSABLE_ENVIRONMENT_VARIABLE: &str = "AGENT_OS_DISPOSABLE_ENVIRONMENT";

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, ValueEnum)]
pub enum RuntimeMode {
    Studio,
    Harness,
    Integration,
    #[default]
    Production,
    SafeMode,
}

impl fmt::Display for RuntimeMode {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(match self {
            Self::Studio => "studio",
            Self::Harness => "harness",
            Self::Integration => "integration",
            Self::Production => "production",
            Self::SafeMode => "safe-mode",
        })
    }
}

#[derive(Debug, Parser)]
#[command(version, name = "Seelen UI")]
pub struct StartupArgs {
    #[arg(long, default_value_t)]
    silent: bool,
    #[arg(long, default_value_t)]
    verbose: bool,
    #[arg(long, value_enum, default_value_t = RuntimeMode::Production)]
    agent_os_mode: RuntimeMode,
    #[arg(long, default_value_t, hide = true)]
    acknowledge_agent_os_disposable_environment: bool,
    #[arg(long, value_name = "MILLISECONDS", hide = true)]
    agent_os_harness_smoke_ms: Option<u64>,
    /// Path or URI to open (e.g. from the Windows protocol handler).
    uri: Option<String>,
}

impl StartupArgs {
    pub fn silent(&self) -> bool {
        self.silent
    }

    pub fn verbose(&self) -> bool {
        self.verbose
    }

    pub fn uri(&self) -> Option<&str> {
        self.uri.as_deref()
    }

    pub fn select_bootstrap(&self) -> Result<StartupSelection, StartupModeError> {
        self.select_bootstrap_with(|name| std::env::var_os(name))
    }

    fn select_bootstrap_with<F>(&self, environment: F) -> Result<StartupSelection, StartupModeError>
    where
        F: Fn(&str) -> Option<OsString>,
    {
        match self.agent_os_mode {
            RuntimeMode::Harness => self.select_harness(),
            RuntimeMode::Integration => self.select_integration(environment),
            RuntimeMode::Production => self.select_production(),
            RuntimeMode::Studio => Err(StartupModeError::BrowserOnlyMode),
            RuntimeMode::SafeMode => Err(StartupModeError::SafeModeNotImplemented),
        }
    }

    fn select_harness(&self) -> Result<StartupSelection, StartupModeError> {
        if self.uri.is_some() {
            return Err(StartupModeError::HarnessUri);
        }
        if self.acknowledge_agent_os_disposable_environment {
            return Err(StartupModeError::UnexpectedDisposableAcknowledgement);
        }
        let smoke_timeout_ms = match self.agent_os_harness_smoke_ms {
            Some(timeout @ 250..=30_000) => Some(timeout),
            Some(_) => return Err(StartupModeError::InvalidHarnessSmokeTimeout),
            None => None,
        };
        Ok(StartupSelection::Harness(HarnessBootstrap {
            smoke_timeout_ms,
        }))
    }

    fn select_integration<F>(&self, environment: F) -> Result<StartupSelection, StartupModeError>
    where
        F: Fn(&str) -> Option<OsString>,
    {
        if self.agent_os_harness_smoke_ms.is_some() {
            return Err(StartupModeError::HarnessSmokeOutsideHarness);
        }
        let environment_confirmed =
            environment(DISPOSABLE_ENVIRONMENT_VARIABLE).is_some_and(|value| value == "1");
        if !self.acknowledge_agent_os_disposable_environment || !environment_confirmed {
            return Err(StartupModeError::IntegrationNotAuthorized);
        }
        Ok(StartupSelection::Effectful(EffectfulBootstrap::new(
            RuntimeMode::Integration,
        )))
    }

    fn select_production(&self) -> Result<StartupSelection, StartupModeError> {
        if self.agent_os_harness_smoke_ms.is_some() {
            return Err(StartupModeError::HarnessSmokeOutsideHarness);
        }
        if self.acknowledge_agent_os_disposable_environment {
            return Err(StartupModeError::UnexpectedDisposableAcknowledgement);
        }
        Ok(StartupSelection::Effectful(EffectfulBootstrap::new(
            RuntimeMode::Production,
        )))
    }
}

#[derive(Debug)]
pub enum StartupSelection {
    Harness(HarnessBootstrap),
    Effectful(EffectfulBootstrap),
}

#[derive(Debug, Clone, Copy)]
pub struct HarnessBootstrap {
    smoke_timeout_ms: Option<u64>,
}

impl HarnessBootstrap {
    pub fn smoke_timeout_ms(self) -> Option<u64> {
        self.smoke_timeout_ms
    }
}

#[derive(Debug)]
pub struct EffectfulBootstrap {
    capability: ShellEffectCapability,
}

impl EffectfulBootstrap {
    fn new(mode: RuntimeMode) -> Self {
        debug_assert!(matches!(
            mode,
            RuntimeMode::Integration | RuntimeMode::Production
        ));
        Self {
            capability: ShellEffectCapability {
                mode,
                _seal: private::Seal,
            },
        }
    }

    pub fn into_capability(self) -> ShellEffectCapability {
        self.capability
    }
}

#[derive(Debug)]
pub struct ShellEffectCapability {
    mode: RuntimeMode,
    _seal: private::Seal,
}

impl ShellEffectCapability {
    pub fn mode(&self) -> RuntimeMode {
        self.mode
    }
}

mod private {
    #[derive(Debug)]
    pub(super) struct Seal;
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StartupModeError {
    BrowserOnlyMode,
    SafeModeNotImplemented,
    HarnessUri,
    IntegrationNotAuthorized,
    UnexpectedDisposableAcknowledgement,
    HarnessSmokeOutsideHarness,
    InvalidHarnessSmokeTimeout,
}

impl fmt::Display for StartupModeError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(match self {
            Self::BrowserOnlyMode => "Studio is browser-only and cannot start the native shell",
            Self::SafeModeNotImplemented => {
                "Safe Mode is reserved for M12 and fails closed until its diagnostics bootstrap exists"
            }
            Self::HarnessUri => "Harness Mode does not accept production URI/CLI forwarding",
            Self::IntegrationNotAuthorized => {
                "Integration Mode requires both --acknowledge-agent-os-disposable-environment and AGENT_OS_DISPOSABLE_ENVIRONMENT=1"
            }
            Self::UnexpectedDisposableAcknowledgement => {
                "the disposable-environment acknowledgement is valid only in Integration Mode"
            }
            Self::HarnessSmokeOutsideHarness => {
                "the harness smoke timeout is valid only in Harness Mode"
            }
            Self::InvalidHarnessSmokeTimeout => {
                "the harness smoke timeout must be between 250 and 30000 milliseconds"
            }
        })
    }
}

impl std::error::Error for StartupModeError {}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse(arguments: &[&str]) -> StartupArgs {
        StartupArgs::try_parse_from(arguments).expect("startup arguments should parse")
    }

    #[test]
    fn production_is_the_unchanged_default() {
        let arguments = parse(&["seelen-ui.exe"]);
        let selection = arguments
            .select_bootstrap_with(|_| None)
            .expect("production should be authorized");
        let StartupSelection::Effectful(effectful) = selection else {
            panic!("default startup must remain production");
        };
        assert_eq!(effectful.into_capability().mode(), RuntimeMode::Production);
    }

    #[test]
    fn harness_never_constructs_a_shell_effect_capability() {
        let arguments = parse(&["seelen-ui.exe", "--agent-os-mode", "harness"]);
        assert!(matches!(
            arguments.select_bootstrap_with(|_| None),
            Ok(StartupSelection::Harness(_))
        ));
    }

    #[test]
    fn integration_requires_two_independent_signals() {
        let without_ack = parse(&["seelen-ui.exe", "--agent-os-mode", "integration"]);
        assert!(matches!(
            without_ack.select_bootstrap_with(|_| Some("1".into())),
            Err(StartupModeError::IntegrationNotAuthorized)
        ));

        let with_ack = parse(&[
            "seelen-ui.exe",
            "--agent-os-mode",
            "integration",
            "--acknowledge-agent-os-disposable-environment",
        ]);
        assert!(matches!(
            with_ack.select_bootstrap_with(|_| None),
            Err(StartupModeError::IntegrationNotAuthorized)
        ));
        let selection = with_ack
            .select_bootstrap_with(|name| {
                (name == DISPOSABLE_ENVIRONMENT_VARIABLE).then(|| "1".into())
            })
            .expect("both integration signals should authorize the bootstrap");
        let StartupSelection::Effectful(effectful) = selection else {
            panic!("integration should be effectful");
        };
        assert_eq!(effectful.into_capability().mode(), RuntimeMode::Integration);
    }

    #[test]
    fn studio_and_unimplemented_safe_mode_fail_closed() {
        for (mode, expected) in [
            ("studio", StartupModeError::BrowserOnlyMode),
            ("safe-mode", StartupModeError::SafeModeNotImplemented),
        ] {
            let arguments = parse(&["seelen-ui.exe", "--agent-os-mode", mode]);
            assert_eq!(
                arguments.select_bootstrap_with(|_| None).unwrap_err(),
                expected
            );
        }
    }

    #[test]
    fn harness_rejects_production_uri_and_invalid_smoke_timeout() {
        let uri = parse(&[
            "seelen-ui.exe",
            "--agent-os-mode",
            "harness",
            "seelen-ui.uri://settings",
        ]);
        assert_eq!(
            uri.select_bootstrap_with(|_| None).unwrap_err(),
            StartupModeError::HarnessUri
        );

        let timeout = parse(&[
            "seelen-ui.exe",
            "--agent-os-mode",
            "harness",
            "--agent-os-harness-smoke-ms",
            "10",
        ]);
        assert_eq!(
            timeout.select_bootstrap_with(|_| None).unwrap_err(),
            StartupModeError::InvalidHarnessSmokeTimeout
        );
    }
}
