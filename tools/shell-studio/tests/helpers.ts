import { expect, type Page } from "@playwright/test";
import type { FixtureName } from "../../../libs/agent-shell-ui/src/state/types.ts";

export async function openFixture(
  page: Page,
  fixture: FixtureName,
): Promise<void> {
  const theme = fixture === "high-contrast" ? "high-contrast" : "dark";
  const motion = fixture === "reduced-motion" ? "reduced" : "normal";
  await page.goto(`/?fixture=${fixture}&theme=${theme}&motion=${motion}`);
  await expect(page.locator('[data-studio-ready="true"]')).toBeVisible();
  await expect(page.locator('[data-testid="preview-canvas"]')).toHaveAttribute(
    "data-fixture",
    fixture,
  );
}
