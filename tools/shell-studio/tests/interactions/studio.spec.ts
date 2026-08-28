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
    await expect(page.locator('[data-testid="surface-orb"]')).toBeVisible();
  }
});

test("Agent UI is dormant until the top-bar button or local Studio hotkey invokes it", async ({ page }) => {
  await openFixture(page, "thinking", { invoke: false });
  const preview = page.locator('[data-testid="preview-canvas"]');
  const agentButton = page.getByRole("button", {
    name: "Open Agent OS",
    exact: true,
  });

  await expect(agentButton).toBeVisible();
  await expect(preview).toHaveAttribute("data-agent-open", "false");
  await expect(page.locator('[data-testid="agent-surface-layer"]')).toHaveCount(
    0,
  );

  await agentButton.click();
  await expect(page.locator('[data-testid="surface-capsule"]')).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close Agent OS", exact: true }),
  )
    .toHaveAttribute("aria-expanded", "true");

  await page.keyboard.press("Control+Shift+Space");
  await expect(page.locator('[data-testid="agent-surface-layer"]')).toHaveCount(
    0,
  );
  await page.keyboard.press("Control+Shift+Space");
  await expect(page.locator('[data-testid="surface-capsule"]')).toBeVisible();
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
  await expect(page.locator(".monitor")).toHaveCount(2);

  const clockBefore = await page.locator('[data-testid="clock-value"]')
    .textContent();
  await page.getByRole("button", { name: "Advance fake clock by 1 second" })
    .click();
  const clockAfter = await page.locator('[data-testid="clock-value"]')
    .textContent();
  expect(Number(clockAfter) - Number(clockBefore)).toBe(1_000);

  const surface = page.locator('[data-testid="agent-surface-layer"]');
  await expect(surface).toBeVisible();
  expect(
    await surface.evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
});

test("approval sheet starts on the safe default and keeps visible keyboard focus", async ({ page }) => {
  await openFixture(page, "waiting-for-approval", { invoke: false });
  await page.keyboard.press("Control+Shift+Space");
  const safeDefault = page.getByRole("button", { name: "Deny", exact: true });
  await expect(safeDefault).toBeFocused();
  const outlineStyle = await safeDefault.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outlineStyle).not.toBe("none");

  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Allow for workflow", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(safeDefault).toBeFocused();
});

test("shell-first mode exposes the pinned Omarchy experience without an agent surface", async ({ page }) => {
  await openShell(page);
  const shell = page.locator('[data-testid="shell-canvas"]');
  await expect(shell).toHaveAttribute("data-theme", "vantablack");
  await expect(shell).toHaveAttribute("data-layout", "dwindle");
  await expect(page.getByLabel("Desktop top bar")).toBeVisible();
  await expect(page.getByRole("article", { name: /Terminal:/u })).toBeVisible();
  await expect(page.locator(".status-node")).toHaveCount(0);
  await expect(page.getByText("Studio simulation · no native shell connection"))
    .toBeVisible();
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
    await expect(page.locator('[data-testid="shell-canvas"]')).toHaveAttribute(
      "data-panel",
      panel,
    );
    await expect(page.getByRole("region", { name: regionName, exact: true }))
      .toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-testid="shell-canvas"]')).toHaveAttribute(
      "data-panel",
      "none",
    );
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
  await expect(page.getByRole("main", { name: "Design workspace" }))
    .toBeVisible();
});

test("launcher search and launch feedback complete the primary keyboard flow", async ({ page }) => {
  await openShell(page, { panel: "launcher" });
  const search = page.getByRole("textbox", { name: "Search applications" });
  await search.fill("term");
  await expect(page.getByRole("button", { name: /Terminal Develop/u }))
    .toBeVisible();
  await expect(page.getByRole("button", { name: /Browser Create/u }))
    .toHaveCount(0);
  await page.getByRole("button", { name: /Terminal Develop/u }).click();
  await expect(page.locator('[data-testid="shell-canvas"]')).toHaveAttribute(
    "data-panel",
    "none",
  );
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
    expect(
      Math.abs(offset),
      JSON.stringify({ bar, center, clock, weather, offsets }),
    ).toBeLessThanOrEqual(0.5);
  }
});

test("light-theme panel scrim covers the entire monitor surface", async ({ page }) => {
  await openShell(page);
  await page.getByLabel("Omarchy theme", { exact: true }).selectOption(
    "catppuccin-latte",
  );
  await page.getByRole("button", { name: "Open quick settings", exact: true })
    .click();

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
    expect(Math.abs(offset), JSON.stringify({ desktop, scrim, edgeOffsets }))
      .toBeLessThanOrEqual(0.5);
  }
  expect(scrimZIndex).toBeGreaterThan(topBarZIndex);
});

test("runtime presentation exposes every sanctioned surface and no generic dashboard", async ({ page }) => {
  const cases = [
    ["idle", "orb"],
    ["thinking", "capsule"],
    ["waiting-for-approval", "sheet"],
    ["image-complete", "stage"],
    ["result-summary", "toast"],
    ["sidecar-context", "sidecar"],
  ] as const;

  for (const [fixture, surface] of cases) {
    await openFixture(page, fixture);
    await expect(page.locator(`[data-testid="surface-${surface}"]`))
      .toBeVisible();
    await expect(page.locator('[data-testid="surface-orb"]')).toBeVisible();
  }

  await openFixture(page, "idle");
  await expect(page.locator('[data-testid="agent-surface-layer"]'))
    .toHaveAttribute("data-surface-count", "1");
  await expect(
    page.locator('[data-testid="preview-canvas"]').getByRole("complementary"),
  ).toHaveCount(0);
  await expect(
    page.locator('[data-testid="preview-canvas"]').getByText(
      /dashboard|chain of thought/iu,
    ),
  ).toHaveCount(0);
});

test("light, dark, high-contrast, and reduced-motion contracts are explicit", async ({ page }) => {
  await openFixture(page, "light-theme");
  await expect(page.locator('[data-testid="preview-canvas"]')).toHaveAttribute(
    "data-theme",
    "light",
  );
  await expect(page.locator('[data-testid="shell-canvas"]')).toHaveAttribute(
    "data-theme",
    "catppuccin-latte",
  );

  await openFixture(page, "dark-theme");
  await expect(page.locator('[data-testid="preview-canvas"]')).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await expect(page.locator('[data-testid="shell-canvas"]')).toHaveAttribute(
    "data-theme",
    "vantablack",
  );

  await openFixture(page, "high-contrast");
  await expect(page.locator('[data-testid="agent-surface-layer"]'))
    .toHaveAttribute("data-aos-theme", "high-contrast");

  await openFixture(page, "reduced-motion");
  const layer = page.locator('[data-testid="agent-surface-layer"]');
  await expect(layer).toHaveAttribute("data-aos-motion", "reduced");
  const reducedAnimation = await page.locator('[data-testid="surface-capsule"]')
    .evaluate((element) => getComputedStyle(element).animationName);
  expect(reducedAnimation).toContain("fade-only");
});

test("Agent surfaces follow the selected active monitor", async ({ page }) => {
  await openFixture(page, "thinking");
  await page.getByLabel("Monitor canvas", { exact: true }).selectOption("2");
  await page.getByLabel("Active monitor", { exact: true }).selectOption(
    "monitor:2",
  );

  const preview = page.locator('[data-testid="preview-canvas"]');
  await expect(preview).toHaveAttribute("data-active-monitor", "monitor:2");
  const monitors = page.locator(".monitor");
  await expect(monitors).toHaveCount(2);
  await expect(monitors.nth(0).locator('[data-testid="agent-surface-layer"]'))
    .toHaveCount(0);
  await expect(monitors.nth(1).locator('[data-testid="agent-surface-layer"]'))
    .toBeVisible();
  await expect(monitors.nth(1)).toHaveClass(/active-monitor/u);
});

test("completion dismisses cleanly back to the dormant top-bar orb", async ({ page }) => {
  await openFixture(page, "result-summary");
  await expect(page.locator('[data-testid="surface-toast"]')).toBeVisible();
  await page.getByRole("button", { name: "Dismiss notification", exact: true })
    .click();
  await expect(page.locator('[data-testid="surface-toast"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="surface-orb"]')).toBeVisible();
  await expect(page.locator('[data-testid="agent-surface-layer"]')).toHaveCount(
    0,
  );
  await expect(page.locator('[data-testid="preview-canvas"]'))
    .toHaveAttribute("data-agent-open", "false");
  await expect(page.getByRole("button", { name: "Open Agent OS", exact: true }))
    .toBeFocused();
});

test("closing blocking and sustained surfaces restores focus to the top-bar Orb", async ({ page }) => {
  await openFixture(page, "waiting-for-approval", { invoke: false });
  await page.keyboard.press("Control+Shift+Space");
  await page.getByRole("button", { name: "Deny", exact: true }).press("Enter");
  const agentButton = page.getByRole("button", {
    name: "Open Agent OS",
    exact: true,
  });
  await expect(agentButton).toBeFocused();

  await openFixture(page, "image-complete", { invoke: false });
  await page.keyboard.press("Control+Shift+Space");
  const closeStage = page.getByRole("button", {
    name: "Close result stage",
    exact: true,
  });
  await closeStage.focus();
  await closeStage.press("Enter");
  await expect(page.getByRole("button", { name: "Open Agent OS", exact: true }))
    .toBeFocused();
});

test("200 percent text scaling keeps the sustained stage inside the active monitor", async ({ page }) => {
  await openFixture(page, "image-complete");
  await page.getByLabel("CSS scale / DPI", { exact: true }).selectOption(
    "200%",
  );

  const desktop = await page.locator(".desktop").boundingBox();
  const stage = await page.locator('[data-testid="surface-stage"]')
    .boundingBox();
  expect(desktop).not.toBeNull();
  expect(stage).not.toBeNull();
  expect(stage!.x).toBeGreaterThanOrEqual(desktop!.x - 0.5);
  expect(stage!.y).toBeGreaterThanOrEqual(desktop!.y - 0.5);
  expect(stage!.x + stage!.width).toBeLessThanOrEqual(
    desktop!.x + desktop!.width + 0.5,
  );
  expect(stage!.y + stage!.height).toBeLessThanOrEqual(
    desktop!.y + desktop!.height + 0.5,
  );
});

test("every contextual surface remains inside its active monitor at 200 percent", async ({ page }) => {
  const cases = [
    ["idle", "capsule"],
    ["thinking", "capsule"],
    ["waiting-for-approval", "sheet"],
    ["image-complete", "stage"],
    ["result-summary", "toast"],
    ["sidecar-context", "sidecar"],
  ] as const;

  for (const [fixture, surfaceName] of cases) {
    await openFixture(page, fixture);
    await page.getByLabel("CSS scale / DPI", { exact: true }).selectOption(
      "200%",
    );
    const desktop = await page.locator(".desktop").boundingBox();
    const surface = await page.locator(`[data-testid="surface-${surfaceName}"]`)
      .boundingBox();
    expect(desktop, fixture).not.toBeNull();
    expect(surface, fixture).not.toBeNull();
    expect(surface!.x, fixture).toBeGreaterThanOrEqual(desktop!.x - 0.5);
    expect(surface!.y, fixture).toBeGreaterThanOrEqual(desktop!.y - 0.5);
    expect(surface!.x + surface!.width, fixture).toBeLessThanOrEqual(
      desktop!.x + desktop!.width + 0.5,
    );
    expect(surface!.y + surface!.height, fixture).toBeLessThanOrEqual(
      desktop!.y + desktop!.height + 0.5,
    );
  }
});

test("every animated surface uses opacity-only entry in reduced-motion mode", async ({ page }) => {
  const cases = [
    ["thinking", "capsule"],
    ["waiting-for-approval", "sheet"],
    ["image-complete", "stage"],
    ["result-summary", "toast"],
    ["sidecar-context", "sidecar"],
  ] as const;

  for (const [fixture, surfaceName] of cases) {
    await openFixture(page, fixture);
    await page.getByLabel("Motion", { exact: true }).selectOption("reduced");
    const style = await page.locator(`[data-testid="surface-${surfaceName}"]`)
      .evaluate((element) => {
        const computed = getComputedStyle(element);
        return {
          animationName: computed.animationName,
          transform: computed.transform,
        };
      });
    expect(style.animationName, fixture).toContain("fade-only");
    expect(style.transform, fixture).toBe("none");
  }
});
