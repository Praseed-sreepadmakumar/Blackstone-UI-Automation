import { Page } from '@playwright/test';
import { getLocator } from '../utils/helpers.js';
import { XPATHS } from '../utils/xpaths.js';

/**
 * BasePage - Base class for all page objects.
 * Handles common functionality like overlay dismissal and navigation.
 * Uses Page Object Model pattern for maintainability and reusability.
 */
export class BasePage {
  readonly page: Page;

  // ── Constants ──────────────────────────────────────────────────────────────
  private static readonly GOTO_TIMEOUT_MS = 45000;
  private static readonly OVERLAY_TIMEOUT_MS = 3000;
  private static readonly OVERLAY_DELAY_MS = 800;

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
    const link = getLocator(this.page, XPATHS.base.cookieAcceptLink, 'I Understand');
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
    const link = getLocator(this.page, XPATHS.base.geoDialogBtn, 'I am not a United States Resident');
    try {
      await link.waitFor({ state: 'visible', timeout: BasePage.OVERLAY_TIMEOUT_MS });
      await link.click();
      await this.page.waitForTimeout(BasePage.OVERLAY_DELAY_MS);
    } catch {
      // Geo dialog did not appear – continue
    }
  }

  /** Best-effort overlay cleanup before clicks that can be blocked by modal backdrops. */
  async dismissEntryOverlays(): Promise<void> {
    await this.dismissCookieBanner();
    await this.dismissResidencyDialog();
  }
}
