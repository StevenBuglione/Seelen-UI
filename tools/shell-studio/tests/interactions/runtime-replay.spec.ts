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
  await page.getByRole("button", {
    name: "Replay M04 runtime trace",
    exact: true,
  }).click();
  await expect(page.locator('[data-testid="runtime-state"]'))
    .toContainText('"fixture": "result-summary"');
  await page.getByRole("button", {
    name: "Show incompatible protocol",
    exact: true,
  }).click();
  await expect(page.locator('[data-testid="runtime-state"]'))
    .toContainText('"fixture": "error-fatal"');
});

test("M05 orb composer submits text and advances through capsule streaming into a stage", async ({ page }) => {
  await openRuntimeTrace(page, "m05-text-turn", { frame: "first" });
  const composer = page.getByRole("form", { name: "Agent OS text composer" });
  await expect(composer).toBeVisible();
  await composer.getByRole("textbox", { name: "Message Agent OS" }).fill(
    "Verify the M05 text transport",
  );
  await composer.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator('[data-testid="surface-capsule"]')).toContainText(
    "Thinking",
  );
  await page.getByRole("button", { name: "Advance M05 runtime event" }).click();
  await expect(page.locator('[data-testid="surface-capsule"]')).toContainText(
    "AGENT OS M05 LIVE VERIFIED",
  );
  await page.getByRole("button", { name: "Advance M05 runtime event" }).click();
  const stage = page.locator('[data-testid="surface-stage"]');
  await expect(stage).toBeVisible();
  await expect(stage).toContainText("AGENT OS M05 LIVE VERIFIED");
  await expect(page.locator('[data-testid="surface-capsule"]')).toHaveCount(0);
});

test("M05 Codex approval renders exact action target data and risk in the sheet", async ({ page }) => {
  await openRuntimeTrace(page, "m05-approval");
  const sheet = page.locator('[data-testid="surface-sheet"]');
  await expect(sheet).toBeVisible();
  await expect(sheet).toContainText("Run a Codex project command");
  await expect(sheet).toContainText("D:/work/agent-os-runtime");
  await expect(sheet).toContainText("cargo test --locked");
  await expect(sheet).toContainText("medium risk");
  await expect(sheet.getByRole("button", { name: "Allow for workflow" }))
    .toBeEnabled();
});

test("M05 restart replay visibly restores the same correlated coordinator thread", async ({ page }) => {
  await openRuntimeTrace(page, "m05-restart");
  await expect(page.locator('[data-testid="surface-capsule"]')).toContainText(
    "Session restored",
  );
  await expect(page.locator('[data-testid="runtime-state"]'))
    .toContainText('"threadId": "thread:m05:coordinator"');
});
