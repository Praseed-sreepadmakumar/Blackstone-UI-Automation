import { Page } from '@playwright/test';
import { getLocator } from '../utils/helpers.js';

/**
 * BasePage - Base class for all page objects.
 * Handles common functionality like overlay dismissal and navigation.
 * Uses Page Object Model pattern for maintainability and reusability.
 */
export class BasePage {
  readonly page: Page;

  // ── Constants ──────────────────────────────────────────────────────────────
  private static readonly GOTO_TIMEOUT_MS = 30000;
  private static readonly OVERLAY_TIMEOUT_MS = 10000;
  private static readonly OVERLAY_DELAY_MS = 800;

  // ── XPath Templates ────────────────────────────────────────────────────────
  // Cookie banner: "I Understand" is an <a class="cc-btn cc-dismiss"> link
  private readonly xpCookieAcceptLink = "//a[normalize-space(text())='PARAM']";
  // Geo / residency dialog (#dialog-geo): anchor identified by aria-label
  private readonly xpGeoDialogBtn     = "//a[@aria-label='PARAM']";

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to the homepage and dismiss all entry overlays. */
  async openHomePage(): Promise<void> {
    try {
      await Promise.race([
        this.page.goto('/'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Navigation timeout')), BasePage.GOTO_TIMEOUT_MS))
      ]);
    } catch (error) {
      // Navigation timeout - attempt to continue with page as-is
      console.warn('Homepage navigation timeout, continuing with test');
    }

    await this.dismissCookieBanner();
    // After cookie is dismissed, the Geo/Attestation dialog appears
    await this.dismissResidencyDialog();
  }

  /** Click "I Understand" on the cookie consent banner if it appears. */
  async dismissCookieBanner(): Promise<void> {
    const link = getLocator(this.page, this.xpCookieAcceptLink, 'I Understand');
    try {
      await link.waitFor({ state: 'visible', timeout: BasePage.OVERLAY_TIMEOUT_MS });
      await link.click();
      await this.page.waitForTimeout(BasePage.OVERLAY_DELAY_MS);
    } catch {
      // Banner not present - continue
    }
  }

  /**
   * Dismiss the Geo / Attestation dialog (#dialog-geo) by clicking
   * "I am not a United States Resident" (an <a aria-label="..."> link).
   * This dialog only becomes visible AFTER the cookie banner is dismissed.
   */
  async dismissResidencyDialog(): Promise<void> {
    const link = getLocator(this.page, this.xpGeoDialogBtn, 'I am not a United States Resident');
    try {
      await link.waitFor({ state: 'visible', timeout: BasePage.OVERLAY_TIMEOUT_MS });
      await link.click();
      await this.page.waitForTimeout(BasePage.OVERLAY_DELAY_MS);
    } catch {
      // Geo dialog did not appear – continue
    }
  }
}
