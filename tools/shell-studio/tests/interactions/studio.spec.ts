import { expect, test } from "@playwright/test";
import { fixtureNames } from "../../../../libs/agent-shell-ui/src/state/types.ts";

import { openFixture, openShell } from "../helpers.ts";

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
  await expect(page.getByLabel("Preview", { exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Approve", exact: true }).focus();
  await expect(page.getByRole("button", { name: "Approve", exact: true }))
    .toBeFocused();
  const outlineStyle = await page.getByRole("button", {
    name: "Approve",
    exact: true,
  }).evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outlineStyle).not.toBe("none");
});

test("shell-first mode exposes the pinned Omarchy experience without an agent surface", async ({ page }) => {
  await openShell(page);
  const shell = page.locator('[data-testid="shell-canvas"]');
  await expect(shell).toHaveAttribute("data-theme", "vantablack");
  await expect(shell).toHaveAttribute("data-layout", "dwindle");
  await expect(page.getByLabel("Desktop top bar")).toBeVisible();
  await expect(page.getByRole("article", { name: /Terminal:/u })).toBeVisible();
  await expect(page.locator(".status-node")).toHaveCount(0);
  await expect(page.getByText("Studio simulation · no native shell connection")).toBeVisible();
});

test("bar controls open each contextual shell panel and Escape dismisses it", async ({ page }) => {
  await openShell(page);
  const cases = [
    ["Open applications", "launcher", "Application launcher"],
    ["Open calendar", "calendar", "Calendar and agenda"],
    ["Open quick settings", "quick-settings", "Quick settings"],
    ["Open notifications", "notifications", "Notifications"],
    ["Open workspace overview", "overview", "Workspace overview"],
  ] as const;

  for (const [buttonName, panel, regionName] of cases) {
    await page.getByRole("button", { name: buttonName, exact: true }).click();
    await expect(page.locator('[data-testid="shell-canvas"]')).toHaveAttribute("data-panel", panel);
    await expect(page.getByRole("region", { name: regionName, exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-testid="shell-canvas"]')).toHaveAttribute("data-panel", "none");
  }
});

test("theme, workspace, and layout controls update the shell contract", async ({ page }) => {
  await openShell(page);
  const contract = page.getByRole("region", { name: "Shell contract" });
  await contract.getByLabel("Omarchy theme").selectOption("rose-pine");
  await contract.getByLabel("Workspace", { exact: true }).selectOption("3");
  await contract.getByLabel("Window layout").selectOption("columns");
  const shell = page.locator('[data-testid="shell-canvas"]');
  await expect(shell).toHaveAttribute("data-theme", "rose-pine");
  await expect(shell).toHaveAttribute("data-workspace", "3");
  await expect(shell).toHaveAttribute("data-layout", "columns");
  await expect(page.getByRole("main", { name: "Design workspace" })).toBeVisible();
});

test("launcher search and launch feedback complete the primary keyboard flow", async ({ page }) => {
  await openShell(page, { panel: "launcher" });
  const search = page.getByRole("textbox", { name: "Search applications" });
  await search.fill("term");
  await expect(page.getByRole("button", { name: /Terminal Develop/u })).toBeVisible();
  await expect(page.getByRole("button", { name: /Browser Create/u })).toHaveCount(0);
  await page.getByRole("button", { name: /Terminal Develop/u }).click();
  await expect(page.locator('[data-testid="shell-canvas"]')).toHaveAttribute("data-panel", "none");
  await expect(page.locator('[data-testid="shell-canvas"]').getByRole("status"))
    .toContainText("Terminal opened in Build");
});

test("top bar center readout shares the bar vertical midpoint", async ({ page }) => {
  await openShell(page);

  const bar = await page.locator(".top-bar").boundingBox();
  const center = await page.locator(".bar-center").boundingBox();
  const clock = await page.locator(".clock-button").boundingBox();
  const weather = await page.locator(".weather").boundingBox();

  expect(bar).not.toBeNull();
  expect(center).not.toBeNull();
  expect(clock).not.toBeNull();
  expect(weather).not.toBeNull();

  const barMidpoint = bar!.y + bar!.height / 2;
  const offsets = {
    center: center!.y + center!.height / 2 - barMidpoint,
    clock: clock!.y + clock!.height / 2 - barMidpoint,
    weather: weather!.y + weather!.height / 2 - barMidpoint,
  };
  for (const offset of Object.values(offsets)) {
    expect(Math.abs(offset), JSON.stringify({ bar, center, clock, weather, offsets })).toBeLessThanOrEqual(0.5);
  }
});

test("light-theme panel scrim covers the entire monitor surface", async ({ page }) => {
  await openShell(page);
  await page.getByLabel("Omarchy theme", { exact: true }).selectOption("catppuccin-latte");
  await page.getByRole("button", { name: "Open quick settings", exact: true }).click();

  const desktop = await page.locator(".desktop").boundingBox();
  const scrim = await page.locator(".panel-scrim").boundingBox();
  const topBarZIndex = await page.locator(".top-bar")
    .evaluate((element) => Number(getComputedStyle(element).zIndex));
  const scrimZIndex = await page.locator(".panel-scrim")
    .evaluate((element) => Number(getComputedStyle(element).zIndex));

  expect(desktop).not.toBeNull();
  expect(scrim).not.toBeNull();

  const edgeOffsets = {
    top: scrim!.y - desktop!.y,
    right: scrim!.x + scrim!.width - (desktop!.x + desktop!.width),
    bottom: scrim!.y + scrim!.height - (desktop!.y + desktop!.height),
    left: scrim!.x - desktop!.x,
  };
  for (const offset of Object.values(edgeOffsets)) {
    expect(Math.abs(offset), JSON.stringify({ desktop, scrim, edgeOffsets })).toBeLessThanOrEqual(0.5);
  }
  expect(scrimZIndex).toBeGreaterThan(topBarZIndex);
});
