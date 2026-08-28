import { expect, type Page } from "@playwright/test";
import type { FixtureName } from "../../../libs/agent-shell-ui/src/state/types.ts";
import type { ShellLayout, ShellPanel, ShellWorkspaceId } from "../../../libs/agent-shell-ui/src/shell/types.ts";

export async function openFixture(
  page: Page,
  fixture: FixtureName,
  options: { invoke?: boolean } = {},
): Promise<void> {
  const theme = fixture === "high-contrast" ? "high-contrast" : fixture === "light-theme" ? "light" : "dark";
  const motion = fixture === "reduced-motion" ? "reduced" : "normal";
  await page.goto(
    `/?mode=fixtures&fixture=${fixture}&theme=${theme}&motion=${motion}`,
  );
  await expect(page.locator('[data-studio-ready="true"]')).toBeVisible();
  await expect(page.locator('[data-testid="preview-canvas"]')).toHaveAttribute(
    "data-fixture",
    fixture,
  );
  if (options.invoke ?? true) {
    await page.getByRole("button", { name: "Open Agent OS", exact: true })
      .click();
    await expect(page.locator('[data-testid="preview-canvas"]'))
      .toHaveAttribute("data-agent-open", "true");
  }
}

export async function openShell(
  page: Page,
  options: {
    panel?: ShellPanel;
    layout?: ShellLayout;
    workspace?: ShellWorkspaceId;
    theme?: string;
    motion?: "normal" | "reduced";
  } = {},
): Promise<void> {
  const parameters = new URLSearchParams({
    mode: "shell",
    shellTheme: options.theme ?? "vantablack",
    panel: options.panel ?? "none",
    layout: options.layout ?? "dwindle",
    workspace: String(options.workspace ?? 1),
    motion: options.motion ?? "normal",
  });
  await page.goto(`/?${parameters.toString()}`);
  await expect(page.locator('[data-studio-ready="true"]')).toBeVisible();
  await expect(page.locator('[data-testid="shell-canvas"]')).toHaveAttribute(
    "data-panel",
    options.panel ?? "none",
  );
}

export async function openRuntimeTrace(
  page: Page,
  trace:
    | "thinking-to-result"
    | "protocol-incompatible"
    | "m05-text-turn"
    | "m05-approval"
    | "m05-restart",
  options: { invoke?: boolean; frame?: "first" | "final" } = {},
): Promise<void> {
  const parameters = new URLSearchParams({
    mode: "fixtures",
    runtimeTrace: trace,
  });
  if (options.frame) parameters.set("runtimeFrame", options.frame);
  await page.goto(`/?${parameters.toString()}`);
  await expect(page.locator('[data-studio-ready="true"]')).toBeVisible();
  await expect(page.locator('[data-testid="runtime-protocol"]'))
    .toContainText(`"replay": "${trace}"`);
  if (options.invoke ?? true) {
    await page.getByRole("button", { name: "Open Agent OS", exact: true })
      .click();
    await expect(page.locator('[data-testid="preview-canvas"]'))
      .toHaveAttribute("data-agent-open", "true");
  }
}
