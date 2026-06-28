import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';

test.describe('Footer Tests', () => {

  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.openHomePage();
  });

  /**
   * TC_FTR_001: Validate Footer Form
   * - Scroll to footer form
   * - Fill mandatory fields
   * - Verify fields accept input
   * - Do NOT submit
   */
  test('TC_FTR_001: Validate Footer Form', async ({ page }) => {
    // Scroll to footer form
    await homePage.scrollToFooterForm();

    // Fill mandatory fields
    await homePage.fillFormField('Email Address *', 'test@example.com');
    await homePage.fillFormField('First Name *', 'Test');
    await homePage.fillFormField('Last Name *', 'User');
    await homePage.fillFormField('Company', 'Acme Corp');

    // Verify fields have the input values
    const emailField = page.locator('xpath=//input[@placeholder="Email Address *"]').first();
    const firstNameField = page.locator('xpath=//input[@placeholder="First Name *"]').first();
    const lastNameField = page.locator('xpath=//input[@placeholder="Last Name *"]').first();

    const email = await emailField.inputValue();
    const firstName = await firstNameField.inputValue();
    const lastName = await lastNameField.inputValue();

    expect(email).toBe('test@example.com');
    expect(firstName).toBe('Test');
    expect(lastName).toBe('User');

    // Verify form is still on page (not submitted)
    expect(page.url()).toContain('blackstone.com');
  });

  /**
   * TC_FTR_002: Validate Footer Branding
   * - Scroll to page bottom
   * - Verify Blackstone footer branding / logo is visible
   */
  test('TC_FTR_002: Validate Footer Branding', async ({ page }) => {
    // Scroll to footer
    await homePage.scrollToFooter();

    // Verify Blackstone branding text is visible in the footer
    const footerBrandingText = page.locator(
      "xpath=//footer//*[contains(normalize-space(text()),'Blackstone') or contains(normalize-space(text()),'blackstone')]"
    ).first();
    await footerBrandingText.waitFor({ state: 'visible', timeout: 10000 });
    await expect(footerBrandingText).toBeVisible();

    // Also check for logo image in footer if present
    const footerLogo = page.locator(
      "xpath=//footer//img[contains(translate(@alt,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ'),'BLACKSTONE') or contains(@src,'logo') or contains(@src,'blackstone')]"
    );
    const logoCount = await footerLogo.count();
    // At minimum the text branding must be visible (logo is a bonus)
    expect(await footerBrandingText.isVisible() || logoCount > 0).toBeTruthy();
  });

  /**
   * TC_FTR_003: Validate Footer Links
   * - Click one footer link
   * - Verify destination page loads correctly
   */
  test('TC_FTR_003: Validate Footer Links', async ({ page }) => {
    // Scroll to footer
    await homePage.scrollToFooter();

    // Get all visible footer links
    const footerLinks = page.locator('xpath=//footer//a[@href]');
    await footerLinks.first().waitFor({ state: 'visible', timeout: 10000 });
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Pick the first footer link that points to a Blackstone page (internal link)
    let targetHref: string | null = null;
    let targetIndex = 0;

    for (let i = 0; i < linkCount; i++) {
      const href = await footerLinks.nth(i).getAttribute('href');
      if (href && href.includes('blackstone.com') && !href.includes('#')) {
        targetHref = href;
        targetIndex = i;
        break;
      }
    }

    // Fallback: use The Firm footer link
    if (!targetHref) {
      const firmLink = page.locator("xpath=//footer//a[normalize-space(text())='The Firm']");
      if (await firmLink.count() > 0) {
        targetHref = await firmLink.getAttribute('href');
        await firmLink.click();
      } else {
        await footerLinks.first().click();
      }
    } else {
      await footerLinks.nth(targetIndex).click();
    }

    await page.waitForLoadState('domcontentloaded');

    // Verify destination page loaded
    expect(page.url()).toContain('blackstone.com');
    await expect(page.locator("xpath=//body")).toBeVisible();
  });

});
