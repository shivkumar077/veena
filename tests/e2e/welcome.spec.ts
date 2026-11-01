import { expect, test } from '@playwright/test';

test('opens the VEENA welcome experience', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/VEENA — Beyond What You Hear/);
  await expect(
    page.getByRole('heading', { name: /music deserves a world of its own/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /skip to content/i }),
  ).toHaveAttribute('href', '#main');
});

for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
  test(`fits the ${width}px target viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /music deserves a world of its own/i }),
    ).toBeVisible();
    const documentWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(documentWidth).toBeLessThanOrEqual(width);
  });
}
