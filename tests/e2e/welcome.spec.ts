import { expect, test } from '@playwright/test';

test('opens the cinematic VEENA welcome with its local landscape', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  await page.goto('/');

  await expect(page).toHaveTitle(/VEENA — Beyond What You Hear/);
  await expect(page.getByRole('heading', { name: 'VEENA' })).toBeVisible();
  await expect(page.getByText('वीणा', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Beyond What You Hear.', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Scroll down to explore' }),
  ).toBeVisible();
  await expect
    .poll(
      () =>
        page.locator('.welcome-landscape--opening img').evaluate((image) => {
          return (image as HTMLImageElement).naturalWidth;
        }),
      { timeout: 15_000 },
    )
    .toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
  test(`composes the welcome without horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'VEENA' })).toBeVisible();
    const image = page.locator('.welcome-landscape--opening img');
    await expect
      .poll(
        () =>
          image.evaluate(
            (element) => (element as HTMLImageElement).naturalWidth,
          ),
        { timeout: 15_000 },
      )
      .toBeGreaterThan(0);

    const layout = await page.evaluate(() => {
      const heading = document.querySelector('.welcome-brand__name');
      const bounds = heading?.getBoundingClientRect();

      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        layoutWidth: document.documentElement.clientWidth,
        headingCenter: bounds ? bounds.x + bounds.width / 2 : 0,
        imageSource: (
          document.querySelector(
            '.welcome-landscape--opening img',
          ) as HTMLImageElement | null
        )?.currentSrc,
      };
    });

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(
      Math.abs(layout.headingCenter - layout.layoutWidth / 2),
    ).toBeLessThan(2);
    expect(layout.imageSource).toContain(
      width < 768 ? 'welcome-portrait.webp' : 'welcome-landscape.webp',
    );
    await expect(
      page.getByRole('link', { name: 'Scroll down to explore' }),
    ).toBeVisible();
  });
}

test('keeps the landscape and scroll prompt composed in mobile landscape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'VEENA' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Scroll down to explore' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('uses the wide composition on a tablet landscape viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'VEENA' })).toBeVisible();
  await expect
    .poll(
      () =>
        page
          .locator('.welcome-landscape--opening img')
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      { timeout: 15_000 },
    )
    .toBe(1920);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('omits falling petals and background animation when reduced motion is requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.getByTestId('blossom-field')).toHaveCount(0);
  await expect(page.locator('.welcome-brand')).toHaveCSS('opacity', '1');
  await expect(page.locator('.welcome-scroll__arrow')).toHaveCSS(
    'animation-name',
    'none',
  );
});

test('scrolling moves into the prepared next section', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Scroll down to explore' }).click();

  await expect(page).toHaveURL(/#explore$/);
  await expect(
    page.getByRole('region', { name: 'Continue exploring VEENA' }),
  ).toBeInViewport();
});

test('uses the atmospheric fallback if the local image fails', async ({
  page,
}) => {
  await page.route('**/assets/welcome/*.webp', (route) => route.abort());
  await page.goto('/');

  await expect(page.locator('.welcome-screen')).toHaveClass(
    /welcome-screen--fallback/,
  );
  await expect(page.getByRole('heading', { name: 'VEENA' })).toBeVisible();
});
