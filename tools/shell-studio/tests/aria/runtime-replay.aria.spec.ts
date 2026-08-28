import { expect, test } from "@playwright/test";

import { openRuntimeTrace } from "../helpers.ts";

for (const trace of ["thinking-to-result", "protocol-incompatible"] as const) {
  test(`M04 ${trace} runtime replay accessibility @snapshot`, async ({ page }) => {
    await openRuntimeTrace(page, trace);
    await expect(page.locator('[data-testid="preview-canvas"]'))
      .toMatchAriaSnapshot({ name: `m04-${trace}.aria.yml` });
  });
}

for (const trace of ["m05-text-turn", "m05-approval"] as const) {
  test(`M05 ${trace} runtime replay accessibility @snapshot`, async ({ page }) => {
    await openRuntimeTrace(page, trace, { frame: "final" });
    await expect(page.locator('[data-testid="preview-canvas"]'))
      .toMatchAriaSnapshot({ name: `${trace}.aria.yml` });
  });
}
