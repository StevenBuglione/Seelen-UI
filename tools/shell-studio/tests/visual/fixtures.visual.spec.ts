import { expect, test } from "@playwright/test";
import { fixtureNames } from "../../../../libs/agent-shell-ui/src/state/types.ts";

import { openFixture } from "../helpers.ts";

for (const fixture of fixtureNames) {
  test(`${fixture} fixture visual @snapshot`, async ({ page }) => {
    await openFixture(page, fixture);
    await expect(page.locator('[data-testid="viewport-frame"]'))
      .toHaveScreenshot(`${fixture}.png`);
  });
}
