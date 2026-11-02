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
  const welcome = page.getByRole('region', { name: 'VEENA welcome' });
  await expect(page.getByRole('heading', { name: 'VEENA' })).toBeVisible();
  await expect(welcome.getByText('वीणा', { exact: true })).toBeVisible();
  await expect(
    welcome.getByText('Beyond What You Hear.', { exact: true }),
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

test('the explore source choices arrive with a prominent staggered reveal over a softly blurred wallpaper', async ({
  page,
}) => {
  await page.goto('/');
  await page.mouse.wheel(0, 80);

  const reveal = await page.evaluate(() => ({
    transitionCount: document
      .querySelector('#main')
      ?.getAttribute('data-transition-count'),
    entering: document
      .querySelector('[data-testid="workspace"]')
      ?.getAttribute('data-transition-entering'),
    headingAnimation: getComputedStyle(
      document.querySelector('.workspace-panel__intro')!,
    ).animationName,
    appleAnimation: getComputedStyle(
      document.querySelector('[data-testid="source-choice-apple-music"]')!,
    ).animationName,
    youtubeDelay: getComputedStyle(
      document.querySelector('[data-testid="source-choice-youtube-music"]')!,
    ).animationDelay,
    localDelay: getComputedStyle(
      document.querySelector('[data-testid="source-choice-local-audio"]')!,
    ).animationDelay,
    wallpaperFilter: getComputedStyle(
      document.querySelector('.welcome-landscape--continuation img')!,
    ).filter,
  }));
  expect(reveal).toEqual({
    transitionCount: '1',
    entering: 'true',
    headingAnimation: 'source-heading-arrive',
    appleAnimation: 'source-choice-arrive',
    youtubeDelay: '0.54s',
    localDelay: '0.76s',
    wallpaperFilter: 'blur(1.4px)',
  });
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
  await expect(page.getByTestId('workspace')).toHaveAttribute(
    'data-transition-entering',
    'false',
  );
  await expect(page.getByTestId('source-choice-apple-music')).toHaveCSS(
    'animation-name',
    'none',
  );
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

test('enters the source-selection home through the blossom transition', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Scroll down to explore' }).click();

  const main = page.locator('#main');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(page).toHaveURL(/#explore$/);
  await expect(
    page.getByRole('region', { name: 'VEENA source selection' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Choose your source' }),
  ).toBeVisible();
  await expect(page.getByTestId(/^source-choice-/)).toHaveCount(3);
  await expect(page.getByRole('navigation')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Listening' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Lyrics' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /welcome/i })).toHaveCount(0);

  await page.mouse.wheel(0, -80);
  await expect(main).toHaveAttribute('data-transition-count', '2');
  await expect(main).toHaveAttribute('data-navigation-direction', 'backward');
  await expect(main).toHaveAttribute('data-navigation-state', 'idle', {
    timeout: 5000,
  });
  await expect(page).not.toHaveURL(/#explore$/);
});

test('the keyboard-accessible skip link enters the workspace through the blossom transition', async ({
  page,
}) => {
  await page.goto('/');
  const skipLink = page.getByRole('link', {
    name: 'Skip to the next section',
  });

  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.locator('#main')).toHaveAttribute(
    'data-transition-count',
    '1',
  );
  await expect(page.locator('#main')).toHaveAttribute(
    'data-navigation-state',
    'idle',
    { timeout: 5000 },
  );
  await expect(
    page.getByRole('region', { name: 'VEENA source selection' }),
  ).toBeVisible();
});

test('the VEENA wordmark returns to the source-selection home', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Scroll down to explore' }).click();
  await expect(page.locator('#main')).toHaveAttribute(
    'data-navigation-state',
    'idle',
    { timeout: 5000 },
  );

  await page.getByTestId('source-choice-apple-music').click();
  await page
    .getByRole('button', { name: 'VEENA source selection home' })
    .click();
  await expect(page.getByTestId('source-choice-apple-music')).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(
    page.getByRole('heading', { name: 'Choose your source' }),
  ).toBeFocused();
});

test('source selection is exclusive and never represents a provider as connected', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Scroll down to explore' }).click();
  await expect(page.locator('#main')).toHaveAttribute(
    'data-navigation-state',
    'idle',
    { timeout: 5000 },
  );

  await page.getByTestId('source-choice-apple-music').click();
  await expect(page.getByRole('status')).toHaveText(
    'Apple Music selected · Not connected.',
  );
  await page.getByTestId('source-choice-youtube-music').click();
  await expect(
    page.getByText(
      'Clear your Apple Music selection before switching sources.',
      { exact: true },
    ),
  ).toHaveAttribute('role', 'status');
  await expect(page.getByTestId('source-choice-apple-music')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByTestId('source-choice-youtube-music')).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('button', { name: 'Clear selection' }).click();
  await page.getByTestId('source-choice-youtube-music').click();
  await expect(page.getByTestId('source-choice-youtube-music')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByTestId(/^source-choice-/)).toHaveCount(3);
  await expect(
    page.locator('input[type="email"], input[type="password"]'),
  ).toHaveCount(0);
});

test('local audio remains on-device and is not played', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Scroll down to explore' }).click();
  await expect(page.locator('#main')).toHaveAttribute(
    'data-navigation-state',
    'idle',
    { timeout: 5000 },
  );

  await page.getByTestId('local-audio-input').setInputFiles({
    name: 'quiet-morning.mp3',
    mimeType: 'audio/mpeg',
    buffer: Buffer.from('local fixture only'),
  });

  await expect(page.getByRole('status')).toHaveText(
    'quiet-morning.mp3 stays on this device.',
  );
  await expect(page.getByTestId('source-choice-local-audio')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('audio, video')).toHaveCount(0);
});

test('source selection remains balanced without horizontal overflow at supported widths', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Scroll down to explore' }).click();
  await expect(page.locator('#main')).toHaveAttribute(
    'data-navigation-state',
    'idle',
    { timeout: 5000 },
  );

  for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => {
      const frame = document.querySelector('.workspace-frame');
      const bounds = frame?.getBoundingClientRect();
      return {
        documentWidth: document.documentElement.scrollWidth,
        frameLeft: bounds?.left ?? 0,
        frameRight: bounds?.right ?? 0,
      };
    });

    expect(dimensions.documentWidth).toBeLessThanOrEqual(width);
    expect(dimensions.frameLeft).toBeGreaterThanOrEqual(0);
    expect(dimensions.frameRight).toBeLessThanOrEqual(width);
    await expect(page.getByTestId('source-choice-apple-music')).toBeVisible();
    await expect(page.getByTestId('source-choice-youtube-music')).toBeVisible();
    await expect(page.getByTestId('source-choice-local-audio')).toBeVisible();
    await expect(page.getByTestId(/^source-choice-/)).toHaveCount(3);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  const sourcePresentation = await page.evaluate(() => {
    const panel = document.querySelector('.workspace-panel');
    const choice = document.querySelector('.workspace-source-choice');
    const icon = document.querySelector('.workspace-source-choice__icon');
    if (!panel || !choice || !icon) {
      throw new Error('The source selection composition is incomplete.');
    }

    return {
      panelBackground: getComputedStyle(panel).backgroundColor,
      panelShadow: getComputedStyle(panel).boxShadow,
      choiceBackground: getComputedStyle(choice).backgroundColor,
      choiceBorder: getComputedStyle(choice).borderWidth,
      iconBackground: getComputedStyle(icon).backgroundColor,
      iconRadius: getComputedStyle(icon).borderRadius,
    };
  });
  expect(sourcePresentation.panelBackground).toBe('rgba(0, 0, 0, 0)');
  expect(sourcePresentation.panelShadow).toBe('none');
  expect(sourcePresentation.choiceBackground).toBe('rgba(0, 0, 0, 0)');
  expect(sourcePresentation.choiceBorder).toBe('0px');
  expect(sourcePresentation.iconBackground).toBe('rgba(0, 0, 0, 0)');
  expect(sourcePresentation.iconRadius).toBe('0px');

  await page.setViewportSize({ width: 375, height: 812 });
  const choices = page.getByTestId(/^source-choice-/);
  for (let index = 0; index < 3; index += 1) {
    const bounds = await choices.nth(index).boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(375);
  }
});

test('keyboard users can focus and select source choices', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Scroll down to explore' }).click();
  await expect(page.locator('#main')).toHaveAttribute(
    'data-navigation-state',
    'idle',
    { timeout: 5000 },
  );

  const appleMusic = page.getByTestId('source-choice-apple-music');
  await appleMusic.focus();
  await expect(appleMusic).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(appleMusic).toHaveAttribute('aria-pressed', 'true');
});
