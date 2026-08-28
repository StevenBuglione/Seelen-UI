use std::{fmt, sync::Mutex};

use super::{namespace::RuntimeNamespace, EffectfulBootstrap, ShellEffectCapability};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ShellEffect {
    NativeTaskbar,
    GlobalWindowHook,
    SeelenService,
    Autostart,
    GlobalShortcut,
    AppBar,
    WallpaperOrWorkspace,
    NativeSystemState,
    OverlayOrDesktopWebview,
    ProductionIpc,
    ProductionData,
    UpdaterOrInstaller,
}

impl ShellEffect {
    pub const ALL: [Self; 12] = [
        Self::NativeTaskbar,
        Self::GlobalWindowHook,
        Self::SeelenService,
        Self::Autostart,
        Self::GlobalShortcut,
        Self::AppBar,
        Self::WallpaperOrWorkspace,
        Self::NativeSystemState,
        Self::OverlayOrDesktopWebview,
        Self::ProductionIpc,
        Self::ProductionData,
        Self::UpdaterOrInstaller,
    ];
}

#[derive(Debug)]
pub struct RealShellAdapter {
    capability: ShellEffectCapability,
    namespace: RuntimeNamespace,
}

impl RealShellAdapter {
    pub fn new(bootstrap: EffectfulBootstrap) -> Self {
        Self {
            capability: bootstrap.into_capability(),
            namespace: RuntimeNamespace::PRODUCTION,
        }
    }

    pub fn capability(&self) -> &ShellEffectCapability {
        &self.capability
    }

    pub fn namespace(&self) -> RuntimeNamespace {
        self.namespace
    }
}

#[derive(Debug, Default)]
pub struct FixtureShellAdapter {
    guard: SideEffectGuard,
    state: FixtureShellState,
    namespace: RuntimeNamespace,
}

impl FixtureShellAdapter {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn state(&self) -> &FixtureShellState {
        &self.state
    }

    pub fn verify_quiescent(&self) -> Result<(), UnexpectedShellEffects> {
        self.guard.verify_quiescent()
    }

    pub fn guarded_effect_count(&self) -> usize {
        ShellEffect::ALL.len()
    }

    pub fn namespace(&self) -> RuntimeNamespace {
        self.namespace
    }

    #[cfg(test)]
    fn attempt_shell_effect(&self, effect: ShellEffect) -> Result<(), ShellEffectDenied> {
        self.guard.deny(effect)
    }
}

#[derive(Debug, Default)]
pub struct FixtureShellState {
    pub monitors: Vec<FixtureMonitor>,
    pub windows: Vec<FixtureWindow>,
    pub workspaces: Vec<FixtureWorkspace>,
    pub notifications: Vec<FixtureNotification>,
}

#[derive(Debug)]
pub struct FixtureMonitor;

#[derive(Debug)]
pub struct FixtureWindow;

#[derive(Debug)]
pub struct FixtureWorkspace;

#[derive(Debug)]
pub struct FixtureNotification;

#[derive(Debug, Default)]
struct SideEffectGuard {
    attempts: Mutex<Vec<ShellEffect>>,
}

impl SideEffectGuard {
    #[cfg(test)]
    fn deny(&self, effect: ShellEffect) -> Result<(), ShellEffectDenied> {
        self.attempts
            .lock()
            .expect("side-effect audit mutex poisoned")
            .push(effect);
        Err(ShellEffectDenied(effect))
    }

    fn verify_quiescent(&self) -> Result<(), UnexpectedShellEffects> {
        let attempts = self
            .attempts
            .lock()
            .expect("side-effect audit mutex poisoned")
            .clone();
        if attempts.is_empty() {
            Ok(())
        } else {
            Err(UnexpectedShellEffects(attempts))
        }
    }
}

#[cfg(test)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct ShellEffectDenied(ShellEffect);

#[cfg(test)]
impl fmt::Display for ShellEffectDenied {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "Harness Mode denied shell effect {:?}", self.0)
    }
}

#[cfg(test)]
impl std::error::Error for ShellEffectDenied {}

#[derive(Debug, PartialEq, Eq)]
pub struct UnexpectedShellEffects(Vec<ShellEffect>);

impl fmt::Display for UnexpectedShellEffects {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            formatter,
            "Harness Mode observed shell effects: {:?}",
            self.0
        )
    }
}

impl std::error::Error for UnexpectedShellEffects {}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::agent_os::runtime_mode::RuntimeMode;
    use crate::agent_os::{StartupArgs, StartupSelection};
    use clap::Parser;

    #[test]
    fn fixture_adapter_starts_empty_and_quiescent() {
        let adapter = FixtureShellAdapter::new();
        assert!(adapter.state().monitors.is_empty());
        assert!(adapter.state().windows.is_empty());
        assert!(adapter.state().workspaces.is_empty());
        assert!(adapter.state().notifications.is_empty());
        assert_eq!(adapter.verify_quiescent(), Ok(()));
    }

    #[test]
    fn every_guarded_shell_effect_fails_the_harness_gate() {
        for effect in ShellEffect::ALL {
            let adapter = FixtureShellAdapter::new();
            assert_eq!(
                adapter.attempt_shell_effect(effect),
                Err(ShellEffectDenied(effect))
            );
            assert_eq!(
                adapter.verify_quiescent(),
                Err(UnexpectedShellEffects(vec![effect]))
            );
        }
    }

    #[test]
    fn real_adapter_can_only_be_built_from_an_effectful_bootstrap() {
        let arguments = StartupArgs::try_parse_from(["seelen-ui.exe"])
            .expect("production arguments should parse");
        let StartupSelection::Effectful(bootstrap) = arguments
            .select_bootstrap()
            .expect("production should authorize")
        else {
            panic!("production should be effectful");
        };
        let adapter = RealShellAdapter::new(bootstrap);
        assert_eq!(adapter.capability().mode(), RuntimeMode::Production);
        assert_eq!(adapter.namespace(), RuntimeNamespace::PRODUCTION);
    }
}
