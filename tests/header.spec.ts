import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';

test.describe('Header Navigation Tests', () => {

  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.openHomePage();
  });

  /**
   * TC_HDR_001: Validate Header Navigation Links
   * - All primary header links are visible
   * - Click first header link → destination page loads
   * - Return to homepage
   * - Click second header link → destination page loads
   * - Return to homepage
   */
  test('TC_HDR_001: Validate Header Navigation Links', async ({ page }) => {
    // Verify all primary header links are visible
    const allLinks = await homePage.getAllHeaderNavLinks();
    const linkCount = await allLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    for (let i = 0; i < linkCount; i++) {
      await expect(allLinks.nth(i)).toBeVisible();
    }

    // Click first header link and verify destination
    const firstLinkHref = await allLinks.first().getAttribute('href');
    await allLinks.first().click();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toBe('about:blank');

    // Return to homepage
    await page.goto('/');
    await homePage.dismissCookieBanner();
    await homePage.dismissResidencyDialog();
    expect(page.url()).toContain('blackstone.com');

    // Get refreshed link list after navigation
    const linksAfterReturn = await homePage.getAllHeaderNavLinks();
    const secondLinkHref = await linksAfterReturn.nth(1).getAttribute('href');

    // Click second header link and verify destination
    await linksAfterReturn.nth(1).click();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toBe('about:blank');

    // Return to homepage
    await page.goto('/');
    await homePage.dismissCookieBanner();
    await homePage.dismissResidencyDialog();
    expect(page.url()).toContain('blackstone.com');
  });

  /**
   * TC_HDR_002: Validate Header Dropdown Navigation
   * - Hover over first header menu ("The Firm") → dropdown appears
   * - Click submenu item "Our People" → destination page loads
   * - Click Blackstone logo → returns to homepage
   * - Hover over second header menu ("What We Do") → dropdown appears
   * - Click submenu item "Real Estate" → destination page loads
   * - Click Blackstone logo → returns to homepage
   */
  test('TC_HDR_002: Validate Header Dropdown Navigation', async ({ page }) => {
    // ── First nav link: "The Firm" ─────────────────────────────────────────
    // Click "The Firm" to open its dropdown
    await homePage.hoverHeaderMenu('The Firm');
    await page.waitForTimeout(800);

    // Click submenu item "Our People" (exclude footer to avoid duplicate match)
    const ourPeopleLink = page.locator(
      "xpath=//a[not(ancestor::footer) and normalize-space(.)='Our People']"
    );
    await ourPeopleLink.waitFor({ state: 'visible', timeout: 8000 });
    await ourPeopleLink.click();
    await page.waitForLoadState('domcontentloaded');

    // Verify destination page loaded
    expect(page.url()).toContain('blackstone.com');
    await expect(page.locator("xpath=//h1 | //h2").first()).toBeVisible();

    // Return to homepage via logo
    await homePage.clickLogoToHome();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toMatch(/blackstone\.com\/?$/);

    // ── Second nav link: "What We Do" ─────────────────────────────────────
    // Click "What We Do" to open its dropdown
    await homePage.hoverHeaderMenu('What We Do');
    await page.waitForTimeout(800);

    // Click submenu item "Real Estate" (exclude footer to avoid duplicate match)
    const realEstateLink = page.locator(
      "xpath=//a[not(ancestor::footer) and normalize-space(.)='Real Estate']"
    );
    await realEstateLink.waitFor({ state: 'visible', timeout: 8000 });
    await realEstateLink.click();
    await page.waitForLoadState('domcontentloaded');

    // Verify destination page loaded
    expect(page.url()).toContain('blackstone.com');
    await expect(page.locator("xpath=//h1 | //h2").first()).toBeVisible();

    // Return to homepage via logo
    await homePage.clickLogoToHome();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toMatch(/blackstone\.com\/?$/);
  });

  /**
   * TC_HDR_003: Validate Search Functionality
   * - Open search
   * - Search for "Real Estate"
   * - Verify search results count > 0
   */
  test('TC_HDR_003: Validate Search Functionality', async ({ page }) => {
    // Open search
    await homePage.openSearch();

    // Type search term and submit
    await homePage.typeSearch('Real Estate');
    await page.waitForLoadState('domcontentloaded');

    // Verify results page loaded
    expect(page.url()).toContain('blackstone.com');

    // Verify result count > 0 — look for result items or count text
    const resultItems = page.locator(
      "xpath=//*[contains(@class,'result') or contains(@class,'search-result') or contains(@class,'Result')]//a | //article | //li[contains(@class,'result')]"
    );
    await resultItems.first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await resultItems.count();
    expect(count).toBeGreaterThan(0);
  });

});
