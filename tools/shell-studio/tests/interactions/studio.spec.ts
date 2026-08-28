import { expect, test } from "@playwright/test";
import { fixtureNames } from "../../../../libs/agent-shell-ui/src/state/types.ts";

import { openFixture } from "../helpers.ts";

test("every required base fixture renders through the shared package", async ({ page }) => {
  await openFixture(page, "idle");
  const fixtureSelect = page.getByLabel("Fixture", { exact: true });
  for (const fixture of fixtureNames) {
    await fixtureSelect.selectOption(fixture);
    await expect(page.locator('[data-testid="preview-canvas"]'))
      .toHaveAttribute("data-fixture", fixture);
    await expect(page.locator(".status-node")).toBeVisible();
  }
});

test("event injection and aostrace replay update inspectable state", async ({ page }) => {
  await openFixture(page, "idle");
  await page.getByRole("button", { name: "Approval", exact: true }).click();
  await expect(page.locator('[data-testid="runtime-state"]')).toContainText(
    "waiting-for-approval",
  );
  await page.getByRole("button", { name: "Replay thinking-to-result.aostrace" })
    .click();
  await expect(page.getByText("Replayed 4 events through sequence 1004"))
    .toBeVisible();
  await expect(page.locator('[data-testid="runtime-state"]')).toContainText(
    "result-summary",
  );
  await expect(page.locator('[data-testid="surface-plan"]')).toContainText(
    "toast",
  );
});

test("viewport, DPI, theme, motion, monitors, and fake clock are controllable", async ({ page }) => {
  await openFixture(page, "thinking");
  await page.getByLabel("Viewport", { exact: true }).selectOption(
    "3440×1440 ultrawide",
  );
  await page.getByLabel("CSS scale / DPI", { exact: true }).selectOption(
    "200%",
  );
  await page.getByLabel("Theme", { exact: true }).selectOption("high-contrast");
  await page.getByLabel("Motion", { exact: true }).selectOption("reduced");
  await page.getByLabel("Monitor canvas", { exact: true }).selectOption("2");
  await expect(page.locator('[data-testid="viewport-frame"]')).toHaveAttribute(
    "data-viewport",
    "3440x1440",
  );
  await expect(page.locator('[data-testid="preview-canvas"]')).toHaveAttribute(
    "data-theme",
    "high-contrast",
  );
  await expect(page.getByRole("article")).toHaveCount(2);

  const clockBefore = await page.locator('[data-testid="clock-value"]')
    .textContent();
  await page.getByRole("button", { name: "Advance fake clock by 1 second" })
    .click();
  const clockAfter = await page.locator('[data-testid="clock-value"]')
    .textContent();
  expect(Number(clockAfter) - Number(clockBefore)).toBe(1_000);

  const surface = page.locator(".fixture-surface");
  await expect(surface).toBeVisible();
  expect(
    await surface.evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
});

test("keyboard focus begins in scenario controls and approval actions have visible focus", async ({ page }) => {
  await openFixture(page, "waiting-for-approval");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Fixture", { exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Approve", exact: true }).focus();
  await expect(page.getByRole("button", { name: "Approve", exact: true }))
    .toBeFocused();
  const outlineStyle = await page.getByRole("button", {
    name: "Approve",
    exact: true,
  }).evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outlineStyle).not.toBe("none");
});
