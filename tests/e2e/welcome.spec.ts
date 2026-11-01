import { expect, test } from '@playwright/test';

test('opens the illustrated VEENA welcome with its local scene', async ({
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
      const headingRange = document.createRange();
      if (heading) {
        headingRange.selectNodeContents(heading);
      }
      const bounds = headingRange.getBoundingClientRect();
      const brand = document.querySelector('.welcome-brand');
      const brandBounds = brand?.getBoundingClientRect();

      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        layoutWidth: document.documentElement.clientWidth,
        headingCenter: bounds ? bounds.x + bounds.width / 2 : 0,
        brandCenterY: brandBounds ? brandBounds.y + brandBounds.height / 2 : 0,
        layoutCenterY: window.innerHeight / 2,
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
    expect(Math.abs(layout.brandCenterY - layout.layoutCenterY)).toBeLessThan(
      3,
    );
    expect(layout.imageSource).toContain(
      width < 768 ? 'veena-world-portrait.svg' : 'veena-world.svg',
    );
    await expect(
      page.getByRole('link', { name: 'Scroll down to explore' }),
    ).toBeVisible();
  });
}

test('keeps the illustrated scene and scroll prompt composed in mobile landscape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'VEENA' })).toBeVisible();
  await expect(
    page.locator('.welcome-landscape--opening img'),
  ).toHaveJSProperty('naturalWidth', 1600);
  await expect(
    page.getByRole('link', { name: 'Scroll down to explore' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('uses the illustrated wide composition on a tablet viewport', async ({
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
    .toBe(1600);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('omits the petal transition and background animation when reduced motion is requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.getByTestId('blossom-transition')).toHaveCount(0);
  await expect(page.locator('.welcome-brand')).toHaveCSS('opacity', '1');
  await expect(page.locator('.welcome-landscape--opening')).toHaveCSS(
    'animation-name',
    'none',
  );
  await expect(page.locator('.welcome-sky-notes span').first()).toHaveCSS(
    'animation-name',
    'none',
  );
  await expect(page.locator('.welcome-scroll__arrow')).toHaveCSS(
    'animation-name',
    'none',
  );
});

test('a small downward wheel gesture completes forward navigation', async ({
  page,
}) => {
  await page.goto('/');
  await page.mouse.wheel(0, 4);

  const main = page.locator('#main');
  await expect(main).toHaveAttribute('data-transition-count', '1');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(page).toHaveURL(/#explore$/);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test('a large downward gesture triggers exactly one section transition', async ({
  page,
}) => {
  await page.goto('/');
  await page.mouse.wheel(0, 1200);
  await page.mouse.wheel(0, 1200);
  await page.mouse.wheel(0, 1200);

  const main = page.locator('#main');
  await expect(main).toHaveAttribute('data-transition-count', '1');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(page).toHaveURL(/#explore$/);
  expect(await page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerHeight + 1),
  );
});

test('scrolling repeatedly during a transition cannot skip or restart it', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.addEventListener(
      'veena:blossom-transition-start',
      () => {
        for (let index = 0; index < 8; index += 1) {
          window.dispatchEvent(
            new WheelEvent('wheel', {
              bubbles: true,
              cancelable: true,
              deltaY: index % 2 === 0 ? 900 : -900,
            }),
          );
        }
      },
      { once: true },
    );
  });
  await page.mouse.wheel(0, 12);
  const main = page.locator('#main');
  await expect(main).toHaveAttribute('data-transition-count', '1');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(main).toHaveAttribute('data-transition-count', '1');
  await expect(page).toHaveURL(/#explore$/);
});

test('the scroll indicator initiates and completes forward navigation', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Scroll down to explore' }).click();

  const main = page.locator('#main');
  await expect(main).toHaveAttribute('data-transition-count', '1');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(page).toHaveURL(/#explore$/);
});

test('a small upward wheel gesture returns to the previous section', async ({
  page,
}) => {
  await page.goto('/');
  const main = page.locator('#main');
  await page.mouse.wheel(0, 8);
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await page.mouse.wheel(0, -4);

  await expect(main).toHaveAttribute('data-transition-count', '2');
  await expect(main).toHaveAttribute('data-navigation-direction', 'backward');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(page).not.toHaveURL(/#explore$/);
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(2);
});

test('forward navigation starts a top-entering downward petal wave before section movement', async ({
  page,
}) => {
  await page.goto('/');
  await page.mouse.wheel(0, 80);

  const main = page.locator('#main');
  const transition = page.getByTestId('blossom-transition');
  await expect(main).toHaveAttribute('data-navigation-state', 'petal-wave');
  await expect(transition).toHaveAttribute('data-entry-edge', 'top');
  await expect(transition).toHaveAttribute('data-direction', 'top-to-bottom');
  await expect(transition).toHaveAttribute('data-source-section', 'top');
  await expect(transition).toHaveAttribute(
    'data-destination-section',
    'explore',
  );
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(2);
});

test('backward navigation starts a bottom-entering upward petal wave', async ({
  page,
}) => {
  await page.goto('/');
  const main = page.locator('#main');
  await page.mouse.wheel(0, 80);
  await expect(main).toHaveAttribute('data-transition-count', '1');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await page.mouse.wheel(0, -80);

  const transition = page.getByTestId('blossom-transition');
  await expect(main).toHaveAttribute('data-navigation-state', 'petal-wave');
  await expect(transition).toHaveAttribute('data-entry-edge', 'bottom');
  await expect(transition).toHaveAttribute('data-direction', 'bottom-to-top');
  await expect(transition).toHaveAttribute('data-source-section', 'explore');
  await expect(transition).toHaveAttribute('data-destination-section', 'top');
});

test('a fast gesture shows the petal wave before the destination moves into view', async ({
  page,
}) => {
  await page.goto('/');
  await page.mouse.wheel(0, 1600);

  const main = page.locator('#main');
  await expect(main).toHaveAttribute('data-navigation-state', 'petal-wave');
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(2);
  await expect(main).toHaveAttribute('data-transition-count', '1');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(page).toHaveURL(/#explore$/);
});

test('repeated scroll-indicator clicks do not interrupt the active transition', async ({
  page,
}) => {
  await page.goto('/');
  const scrollLink = page.getByRole('link', {
    name: 'Scroll down to explore',
  });
  await scrollLink.evaluate((element) => {
    for (let index = 0; index < 5; index += 1) {
      element.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
      );
    }
  });

  const main = page.locator('#main');
  await expect(main).toHaveAttribute('data-transition-count', '1');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(page).toHaveURL(/#explore$/);
});

test('mobile swipes navigate forward and backward without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  const swipe = async (startY: number, endY: number) => {
    await page.evaluate(
      ({ startY: start, endY: end }) => {
        const dispatchTouch = (
          type: string,
          clientY: number,
          touches: number,
        ) => {
          const event = new Event(type, { bubbles: true, cancelable: true });
          const point = { clientX: 180, clientY };
          Object.defineProperty(event, 'touches', {
            value: touches ? [point] : [],
          });
          Object.defineProperty(event, 'changedTouches', {
            value: [point],
          });
          window.dispatchEvent(event);
        };

        dispatchTouch('touchstart', start, 1);
        dispatchTouch('touchmove', end, 1);
        dispatchTouch('touchend', end, 0);
      },
      { startY, endY },
    );
  };

  const main = page.locator('#main');
  await swipe(700, 300);
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(page).toHaveURL(/#explore$/);

  await swipe(300, 700);
  await expect(main).toHaveAttribute('data-transition-count', '2');
  await expect(main).toHaveAttribute('data-navigation-direction', 'backward');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(page).not.toHaveURL(/#explore$/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('reduced-motion navigation reaches the destination immediately', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.mouse.wheel(0, 12);

  const main = page.locator('#main');
  await expect(main).toHaveAttribute('data-transition-count', '1');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle');
  await expect(page).toHaveURL(/#explore$/);
  await expect(page.getByTestId('blossom-transition')).toHaveCount(0);
});

test('PageDown and PageUp navigate between sections from the keyboard', async ({
  page,
}) => {
  await page.goto('/');
  const main = page.locator('#main');

  await page.keyboard.press('PageDown');
  await expect(main).toHaveAttribute('data-transition-count', '1');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(page).toHaveURL(/#explore$/);

  await page.keyboard.press('PageUp');
  await expect(main).toHaveAttribute('data-transition-count', '2');
  await expect(main).toHaveAttribute('data-navigation-direction', 'backward');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(page).not.toHaveURL(/#explore$/);
});

test('returns to idle after completion and accepts the next navigation', async ({
  page,
}) => {
  await page.goto('/');
  const main = page.locator('#main');

  await page.mouse.wheel(0, 8);
  await expect(main).toHaveAttribute('data-transition-count', '1');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(main).toHaveAttribute('data-transition-count', '1');

  await page.mouse.wheel(0, -8);
  await expect(main).toHaveAttribute('data-transition-count', '2');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(page).not.toHaveURL(/#explore$/);
});

test('uses the atmospheric fallback if the illustrated scene fails', async ({
  page,
}) => {
  await page.route('**/assets/welcome/*.svg', (route) => route.abort());
  await page.goto('/');

  await expect(page.locator('.welcome-screen')).toHaveClass(
    /welcome-screen--fallback/,
  );
  await expect(page.getByRole('heading', { name: 'VEENA' })).toBeVisible();
});
