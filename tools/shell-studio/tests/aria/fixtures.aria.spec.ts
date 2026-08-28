import { expect, test } from "@playwright/test";
import { fixtureNames } from "../../../../libs/agent-shell-ui/src/state/types.ts";

import { openFixture } from "../helpers.ts";

for (const fixture of fixtureNames) {
  test(`${fixture} fixture accessibility @snapshot`, async ({ page }) => {
    await openFixture(page, fixture, {
      invoke: fixture !== "idle" && fixture !== "hovered",
    });
    await expect(page.locator('[data-testid="preview-canvas"]'))
      .toMatchAriaSnapshot({
        name: `${fixture}.aria.yml`,
      });
  });
}
