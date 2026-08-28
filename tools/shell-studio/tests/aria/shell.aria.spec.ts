import { expect, test } from "@playwright/test";

import { openShell } from "../helpers.ts";

const states = [
  "none",
  "launcher",
  "calendar",
  "quick-settings",
  "notifications",
  "overview",
] as const;

for (const panel of states) {
  test(`Omarchy Vantablack ${panel} shell accessibility @snapshot`, async ({ page }) => {
    await openShell(page, { panel });
    await expect(page.locator('[data-testid="shell-canvas"]')).toMatchAriaSnapshot({
      name: `shell-vantablack-${panel}.aria.yml`,
    });
  });
}
