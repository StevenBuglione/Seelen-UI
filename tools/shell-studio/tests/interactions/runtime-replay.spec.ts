import { expect, test } from "@playwright/test";

import { openRuntimeTrace } from "../helpers.ts";

test("M04 typed runtime replay drives the real completion surface", async ({ page }) => {
  await openRuntimeTrace(page, "thinking-to-result");
  await expect(page.locator('[data-testid="surface-toast"]')).toBeVisible();
  await expect(page.locator('[data-testid="surface-toast"]'))
    .toContainText("The typed runtime replay completed safely.");
  await expect(page.locator('[data-testid="runtime-state"]'))
    .toContainText('"fixture": "result-summary"');
  await expect(page.locator('[data-testid="surface-plan"]'))
    .toContainText('"kind": "toast"');
});

test("M04 incompatible protocol is visibly fail-closed", async ({ page }) => {
  await openRuntimeTrace(page, "protocol-incompatible");
  const stage = page.locator('[data-testid="surface-stage"]');
  await expect(stage).toBeVisible();
  await expect(stage).toContainText("Agent OS needs an update");
  await expect(stage).toContainText("Windows remains unchanged");
  await expect(page.locator('[data-testid="surface-sheet"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="surface-capsule"]')).toHaveCount(0);
});

test("Studio controls can switch between both committed M04 runtime traces", async ({ page }) => {
  await page.goto("/?mode=fixtures&fixture=thinking");
  await expect(page.locator('[data-studio-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Replay M04 runtime trace", exact: true }).click();
  await expect(page.locator('[data-testid="runtime-state"]'))
    .toContainText('"fixture": "result-summary"');
  await page.getByRole("button", { name: "Show incompatible protocol", exact: true }).click();
  await expect(page.locator('[data-testid="runtime-state"]'))
    .toContainText('"fixture": "error-fatal"');
});
