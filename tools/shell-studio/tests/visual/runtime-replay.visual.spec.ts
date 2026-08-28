import { expect, test } from "@playwright/test";

import { openRuntimeTrace } from "../helpers.ts";

for (const trace of ["thinking-to-result", "protocol-incompatible"] as const) {
  test(`M04 ${trace} runtime replay visual @snapshot`, async ({ page }) => {
    await openRuntimeTrace(page, trace);
    await expect(page.locator('[data-testid="viewport-frame"]'))
      .toHaveScreenshot(`m04-${trace}.png`);
  });
}
