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
  test(`Omarchy Vantablack ${panel} shell visual @snapshot`, async ({ page }) => {
    await openShell(page, { panel });
    await expect(page.locator('[data-testid="viewport-frame"]'))
      .toHaveScreenshot(`shell-vantablack-${panel}.png`);
  });
}

test("Omarchy Vantablack top bar visual @snapshot", async ({ page }) => {
  await openShell(page);
  await expect(page.locator(".top-bar")).toHaveScreenshot(
    "shell-vantablack-top-bar.png",
    {
      maxDiffPixels: 0,
    },
  );
});
