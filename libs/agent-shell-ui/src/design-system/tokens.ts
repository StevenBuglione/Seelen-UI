import type { OmarchyThemeId } from "../themes/omarchy.ts";
import type { StudioTheme } from "../state/types.ts";

export const AGENT_OS_TOKEN_VERSION = "1.0.0" as const;

export const agentThemeShellTheme = {
  dark: "vantablack",
  light: "catppuccin-latte",
  "high-contrast": "vantablack",
} as const satisfies Record<StudioTheme, OmarchyThemeId>;

export const agentSurfaceKinds = [
  "orb",
  "capsule",
  "sheet",
  "stage",
  "toast",
  "sidecar",
] as const;
