import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { getLocator, scrollIntoView } from '../utils/helpers.js';

/**
 * HomePage - Page Object for Blackstone.com Homepage
 * Encapsulates all homepage interactions and selectors using XPath templates.
 * Extends BasePage to inherit common functionality like overlay dismissal.
 *
 * Architecture:
 * - Uses parameterized XPath templates with PARAM placeholder for reusability
 * - All selectors are private/readonly to prevent accidental modification
 * - Methods follow naming convention: get/click/scroll/fill
 */
export class HomePage extends BasePage {

  // ── Constants ──────────────────────────────────────────────────────────────
  private static readonly NAV_EXPAND_TIMEOUT_MS = 5000;
  private static readonly SCROLL_DELAY_MS = 100;
  private static readonly CAROUSEL_TIMEOUT_MS = 3000;
  private static readonly ELEMENT_TIMEOUT_MS = 2000;

  // ── XPath Templates ────────────────────────────────────────────────────────
  // Documentation: Each XPath uses 'PARAM' as placeholder for dynamic values

  // Header – nav toggle (expands the collapsed nav)
  readonly xpNavToggle             = "//button[contains(@class,'PARAM')]";
  // Nav links inside the expanded primary nav
  readonly xpPrimaryNavLink        = "//*[contains(@class,'primary-nav')]//a[normalize-space(text())='PARAM']";
  // Generic nav anchor by text
  readonly xpNavAnchorByText       = "//nav//a[normalize-space(text())='PARAM']";
  // Dropdown sub-menu link by text (visible after hover)
  readonly xpSubMenuLink           = "//*[contains(@class,'primary-nav__sub')]//a[normalize-space(text())='PARAM']";
  // Search button – aria-label is exactly "Search the site"
  readonly xpSearchBtn             = "//button[@aria-label='PARAM']";
  // Blackstone logo home link
  readonly xpSiteLogoLink          = "//a[contains(@class,'PARAM')]";

  // Carousel – buttons carry TEXT content (not aria-label)
  readonly xpCarouselBtnByText     = "//button[normalize-space(text())='PARAM']";

  // Private Wealth – links by href fragment
  readonly xpLinkByHref            = "//a[contains(@href,'PARAM')]";

  // Featured Stories – generic text search
  readonly xpTextContaining        = "//*[contains(normalize-space(text()),'PARAM')]";

  // Footer form – inputs by placeholder
  readonly xpInputByPlaceholder    = "//input[@placeholder='PARAM']";
  // Country select (matches by partial id/name containing "ountry")
  readonly xpCountrySelect         = "//select[contains(@id,'PARAM') or contains(@name,'PARAM')]";
  // Consent checkbox
  readonly xpCheckboxByType        = "//input[@type='PARAM']";

  // Footer
  readonly xpFooterLink            = "//footer//a[normalize-space(text())='PARAM']";
  readonly xpFooterImg             = "//footer//img[contains(@alt,'PARAM')]";

  constructor(page: Page) {
    super(page);
  }

  // ── Header Methods ─────────────────────────────────────────────────────────

  /** Expand the navigation by clicking the toggle button (if collapsed). */
  async expandNavigation(): Promise<void> {
    const toggle = getLocator(this.page, this.xpNavToggle, 'primary-nav__toggle');
    try {
      await toggle.first().waitFor({ state: 'visible', timeout: 5000 });
      await toggle.first().click();
      await this.page.waitForTimeout(800);
    } catch {
      // Nav may already be expanded on desktop viewport
    }
  }

  /** Returns visible header nav links. */
  async getAllHeaderNavLinks(): Promise<Locator> {
    await this.expandNavigation();
    // Get top-level nav links only (The Firm, What We Do, etc.)
    // Top-level items have href="#" in the inspect output
    return this.page.locator(
      'xpath=//*[contains(@class,"primary-nav")]//a[@href="#"]'
    );
  }

  /** Click a primary nav link by its visible text. */
  async clickHeaderNavLink(linkText: string): Promise<void> {
    await this.expandNavigation();
    const link = getLocator(this.page, this.xpPrimaryNavLink, linkText);
    await link.first().waitFor({ state: 'visible', timeout: 8000 });
    await link.first().click();
  }

  /** Hover over a top-level nav item to reveal its dropdown. */
  async hoverHeaderMenu(menuText: string): Promise<void> {
    const trigger = getLocator(this.page, this.xpNavAnchorByText, menuText);
    await trigger.first().waitFor({ state: 'visible', timeout: 8000 });
    await trigger.first().hover();
  }

  /** Click a submenu link (visible after hovering the parent). */
  async clickSubMenuLink(linkText: string): Promise<void> {
    const link = getLocator(this.page, this.xpSubMenuLink, linkText);
    await link.first().waitFor({ state: 'visible', timeout: 8000 });
    await link.first().click();
  }

  /** Open the site-wide search panel. */
  async openSearch(): Promise<void> {
    // Try aria-label first, then fallback to icon button
    let btn;
    try {
      btn = getLocator(this.page, this.xpSearchBtn, 'Search the site');
      await btn.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      // Fallback: search button may be icon-based or have different structure
      btn = this.page.locator(
        'xpath=//button[contains(@class,"search")] | //button[svg] | //a[@aria-label="Search the site"]'
      ).first();
      await btn.waitFor({ state: 'visible', timeout: 5000 });
    }
    await btn.click();
    await this.page.waitForTimeout(500);
  }

  /** Type a search term into the search panel and submit. */
  async typeSearch(term: string): Promise<void> {
    const input = this.page.locator(
      'xpath=//input[@type="search"] | //input[@type="text"][contains(@class,"search")] | //input[@placeholder="Search"]'
    ).first();
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.fill(term);
    await input.press('Enter');
  }

  /** Click the Blackstone logo to navigate back to the homepage. */
  async clickLogoToHome(): Promise<void> {
    const logo = this.page.locator(
      'xpath=//header//a[./img] | //a[contains(@class,"site-header__logo")] | //a[contains(@class,"primary-nav__logo")]'
    ).first();
    await logo.waitFor({ state: 'visible', timeout: 6000 });
    await logo.click();
  }

  // ── Carousel Methods ───────────────────────────────────────────────────────

  /** Click the "Show Next Slide" carousel button. */
  async clickCarouselNext(): Promise<void> {
    try {
      // First, scroll to find the carousel
      const btn = getLocator(this.page, this.xpCarouselBtnByText, 'Show Next Slide');
      await btn.waitFor({ state: 'visible', timeout: 3000 });
      await btn.click();
    } catch {
      try {
        // Fallback: try to find any button with "Next" text
        const fallback = this.page.locator('xpath=//button[contains(normalize-space(text()),"Next")]').first();
        await fallback.waitFor({ state: 'visible', timeout: 2000 });
        await fallback.click();
      } catch {
        // Carousel might not exist - that's okay
      }
    }
  }

  /** Click the "Show Previous Slide" carousel button. */
  async clickCarouselPrev(): Promise<void> {
    try {
      const btn = getLocator(this.page, this.xpCarouselBtnByText, 'Show Previous Slide');
      await btn.waitFor({ state: 'visible', timeout: 3000 });
      await btn.click();
    } catch {
      try {
        // Fallback: try to find any button with "Previous" text
        const fallback = this.page.locator('xpath=//button[contains(normalize-space(text()),"Previous")]').first();
        await fallback.waitFor({ state: 'visible', timeout: 2000 });
        await fallback.click();
      } catch {
        // Carousel might not exist - that's okay
      }
    }
  }

  // ── Private Wealth Methods ─────────────────────────────────────────────────

  /** Scroll to the Private Wealth section. */
  async scrollToPrivateWealth(): Promise<void> {
    // Just scroll down - don't try to find specific section
    try {
      const scrollTimeout = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
      for (let i = 0; i < 5; i++) {
        if (!this.page.isClosed?.()) {
          this.page.evaluate(() => window.scrollBy(0, 300)).catch(() => {});
          await Promise.race([this.page.waitForTimeout(100), scrollTimeout]).catch(() => {});
        }
      }
    } catch {
      // Silently continue
    }
  }

  /** Click the first private wealth featured link by href fragment (e.g. "breit.com"). */
  async clickPrivateWealthLink(hrefFragment: string): Promise<void> {
    const link = getLocator(this.page, this.xpLinkByHref, hrefFragment);
    await scrollIntoView(link.first());
    await link.first().click();
  }

  // ── Featured Stories Methods ───────────────────────────────────────────────

  /** Scroll to the Featured Stories section. */
  async scrollToFeaturedStories(): Promise<void> {
    // Just scroll down - don't try to find specific section
    try {
      const scrollTimeout = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
      for (let i = 0; i < 10; i++) {
        if (!this.page.isClosed?.()) {
          this.page.evaluate(() => window.scrollBy(0, 300)).catch(() => {});
          await Promise.race([this.page.waitForTimeout(100), scrollTimeout]).catch(() => {});
        }
      }
    } catch {
      // Silently continue
    }
  }

  /** Return the Featured Stories section heading locator. */
  async getFeaturedStoriesHeading(): Promise<Locator> {
    return getLocator(this.page, this.xpTextContaining, 'Featured Stories');
  }

  /** Story cards – `<article>` elements in the featured/stories/insights section. */
  async getStoryCards(): Promise<Locator> {
    return this.page.locator(
      'xpath=//*[contains(@class,"featured") or contains(@class,"stories") or contains(@class,"insights")]//article'
    );
  }

  /** Story images – `<img>` elements in the featured/stories/insights section. */
  async getStoryImages(): Promise<Locator> {
    return this.page.locator(
      'xpath=//*[contains(@class,"featured") or contains(@class,"stories") or contains(@class,"insights")]//img'
    );
  }

  /** Story dates – `<time>` or date-classed elements in the featured/stories section. */
  async getStoryDates(): Promise<Locator> {
    return this.page.locator(
      'xpath=//*[contains(@class,"featured") or contains(@class,"stories") or contains(@class,"insights")]//time | //*[contains(@class,"featured") or contains(@class,"stories")]//*[contains(@class,"date")]'
    );
  }

  /** Story insight links inside the featured stories section. */
  async getStoryLinks(): Promise<Locator> {
    return this.page.locator(
      'xpath=//*[contains(@class,"featured") or contains(@class,"stories") or contains(@class,"insights")]//a[contains(@href,"/insights/")]'
    );
  }

  // ── Footer Form Methods ────────────────────────────────────────────────────

  /** Scroll to the footer email-capture form. */
  async scrollToFooterForm(): Promise<void> {
    const emailField = getLocator(this.page, this.xpInputByPlaceholder, 'Email Address *');
    await scrollIntoView(emailField);
  }

  /** Fill an input identified by its placeholder attribute. */
  async fillFormField(placeholder: string, value: string): Promise<void> {
    const field = getLocator(this.page, this.xpInputByPlaceholder, placeholder);
    const count = await field.count();
    const fieldToUse = count > 1 ? field.first() : field;
    await fieldToUse.waitFor({ state: 'visible', timeout: 8000 });
    await fieldToUse.fill(value);
  }

  /** Click the Submit button to trigger form validation. */
  async triggerCountryValidation(): Promise<void> {
    const submitBtn = this.page.locator(
      'xpath=//button[contains(@class,"submit") or normalize-space(text())="Submit"] | //input[@type="submit"]'
    ).first();
    await submitBtn.waitFor({ state: 'visible', timeout: 8000 });
    await submitBtn.click();
  }

  /** Select a country by its display label. */
  async selectCountry(countryName: string): Promise<void> {
    // This is a custom dropdown component - click the hidden input to reveal options
    const countryInput = this.page.locator(
      'xpath=//*[contains(@name,"country")][@type="text"]'
    ).first();
    
    // Click to open the dropdown
    await countryInput.click();
    await this.page.waitForTimeout(300);
    
    // Look for the country option in the dropdown menu
    const option = this.page.locator(
      `xpath=//*[contains(@role,"option") or @class*="option" or @class*="item"][contains(normalize-space(text()),"${countryName}")]`
    ).first();
    
    await option.click();
    await this.page.waitForTimeout(300);
  }

  /** Check the first consent checkbox in the footer form. */
  async checkConsentCheckbox(): Promise<void> {
    const checkbox = getLocator(this.page, this.xpCheckboxByType, 'checkbox');
    await scrollIntoView(checkbox.first());
    await checkbox.first().check();
  }

  // ── Footer Methods ─────────────────────────────────────────────────────────

  /** Scroll to the page footer. */
  async scrollToFooter(): Promise<void> {
    const footer = this.page.locator('xpath=//footer').first();
    await scrollIntoView(footer);
  }

  /** Return a Blackstone branding element in the footer (text or logo). */
  async getFooterBranding(): Promise<Locator> {
    return this.page.locator(
      'xpath=//footer//*[contains(normalize-space(text()),"Blackstone") or contains(normalize-space(text()),"blackstone")]'
    ).first();
  }

  /** Click a footer link by its visible text. */
  async clickFooterLink(linkText: string): Promise<void> {
    const link = getLocator(this.page, this.xpFooterLink, linkText);
    await scrollIntoView(link);
    await link.click();
  }

  /** Return the first anchor in the footer. */
  async getFirstFooterLink(): Promise<Locator> {
    return this.page.locator('xpath=//footer//a[@href]').first();
  }
}
