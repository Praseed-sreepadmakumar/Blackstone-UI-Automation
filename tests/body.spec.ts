import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { captureStepScreenshot } from '../utils/helpers.js';
import { XPATHS } from '../utils/xpaths.js';

test.describe('Body Content Tests', () => {

  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.openHomePage();
  });

  /**
   * TC_BODY_001: Validate Hero Carousel
   * - Click right (next) arrow twice
   * - Click left (prev) arrow once
   * - Carousel navigates correctly, images change without errors
   */
  test('TC_BODY_001: Validate Hero Carousel', async ({ page }, testInfo) => {
    const initialStatus = await homePage.getHeroCarouselStatusText();
    await captureStepScreenshot(page, testInfo, 'body-001-initial-carousel-state', false);

    await homePage.clickCarouselNext();
    await expect
      .poll(async () => homePage.getHeroCarouselStatusText())
      .not.toBe(initialStatus);
    const afterFirstNext = await homePage.getHeroCarouselStatusText();
    await captureStepScreenshot(page, testInfo, 'body-001-after-first-next', false);

    await homePage.clickCarouselNext();
    await expect
      .poll(async () => homePage.getHeroCarouselStatusText())
      .not.toBe(afterFirstNext);
    const afterSecondNext = await homePage.getHeroCarouselStatusText();

    await homePage.clickCarouselPrev();
    await expect
      .poll(async () => homePage.getHeroCarouselStatusText())
      .toBe(afterFirstNext);

    expect(initialStatus).not.toBe(afterFirstNext);
    expect(afterFirstNext).not.toBe(afterSecondNext);
    expect(page.url()).toContain('blackstone.com');
    await captureStepScreenshot(page, testInfo, 'body-001-final-carousel-state', false);
  });

  /**
   * TC_BODY_002: Validate Private Wealth Section
   * - Scroll to Private Wealth section
   * - Click a featured link
   * - Verify page loads
   * - Click logo to return to homepage
   */
  test('TC_BODY_002: Validate Private Wealth Section', async ({ page }, testInfo) => {
    await homePage.scrollToPrivateWealth();

    const privateWealthHeading = page.getByRole('heading', {
      name: 'Institutional quality for individual investors'
    }).first();
    await expect(privateWealthHeading).toBeVisible();

    const privateWealthLearnMore = page.locator(`xpath=${XPATHS.home.privateWealthLearnMoreLink}`).first();
    await expect(privateWealthLearnMore).toBeVisible();
    await captureStepScreenshot(page, testInfo, 'body-002-private-wealth-section', false);

    await Promise.all([
      page.waitForURL(/blackstone\.com\/(?:[a-z-]+\/)?pws\/?$/i),
      privateWealthLearnMore.click()
    ]);

    await expect(page).toHaveURL(/blackstone\.com\/(?:[a-z-]+\/)?pws\/?$/i);
    await expect(page.locator(`xpath=${XPATHS.home.bodyElement}`)).toBeVisible();
    await captureStepScreenshot(page, testInfo, 'body-002-private-wealth-destination', false);

    await homePage.clickLogoToHome();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/blackstone\.com\/(?:[a-z-]+\/)?$/i);
  });

  /**
   * TC_BODY_003: Validate Featured Stories Section
   * - Scroll to Featured Stories
   * - Verify section title
   * - Verify four story cards
   * - Verify four images
   * - Verify four dates
   * - Verify links are clickable
   */
  test('TC_BODY_003: Validate Featured Stories Section', async ({ page }, testInfo) => {
    await homePage.scrollToFeaturedStories();

    const featuredStoriesHeading = await homePage.getFeaturedStoriesHeading();
    await expect(featuredStoriesHeading).toBeVisible();

    const storyCards = await homePage.getStoryCards();
    const storyImages = await homePage.getStoryImages();
    const storyDates = await homePage.getStoryDates();
    const storyLinks = await homePage.getStoryLinks();

    await expect(storyCards).toHaveCount(4);
    await expect(storyImages).toHaveCount(4);
    await expect(storyDates).toHaveCount(4);
    await expect(storyLinks).toHaveCount(4);
    await captureStepScreenshot(page, testInfo, 'body-003-featured-stories-section', true);

    const firstStoryHref = await storyLinks.first().getAttribute('href');
    expect(firstStoryHref).toContain('/insights/article/');

    await Promise.all([
      page.waitForURL(/blackstone\.com\/(?:[a-z-]+\/)?insights\/article\//i),
      storyLinks.first().click()
    ]);

    await expect(page.locator(`xpath=${XPATHS.home.bodyElement}`)).toBeVisible();
    await expect(page).toHaveURL(/blackstone\.com\/(?:[a-z-]+\/)?insights\/article\//i);
    await captureStepScreenshot(page, testInfo, 'body-003-featured-story-article', false);

    await homePage.clickLogoToHome();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/blackstone\.com\/(?:[a-z-]+\/)?$/i);
  });

});
