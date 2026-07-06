import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { getLocator, scrollIntoView } from '../utils/helpers.js';
import { XPATHS } from '../utils/xpaths.js';

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

  constructor(page: Page) {
    super(page);
  }

  // ── Header Methods ─────────────────────────────────────────────────────────

  /** Expand the navigation by clicking the toggle button (if collapsed). */
  async expandNavigation(): Promise<void> {
    const toggle = getLocator(this.page, XPATHS.home.navToggle, 'primary-nav__toggle');
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
    return this.page.locator(`xpath=${XPATHS.home.primaryNavTopLevelLinks}`);
  }

  /** Click a primary nav link by its visible text. */
  async clickHeaderNavLink(linkText: string): Promise<void> {
    await this.expandNavigation();
    const link = getLocator(this.page, XPATHS.home.primaryNavLink, linkText);
    await link.first().waitFor({ state: 'visible', timeout: 8000 });
    await link.first().click();
  }

  /** Click a top-level nav item to open its dropdown (click-activated chevron menus). */
  async hoverHeaderMenu(menuText: string): Promise<void> {
    // Exclude footer ancestors; use normalize-space(.) to match text across child elements
    const trigger = getLocator(this.page, XPATHS.home.hoverMenuTriggerByText, menuText);
    await trigger.first().waitFor({ state: 'visible', timeout: 8000 });
    await trigger.first().click();
  }

  /** Click a submenu link (visible after hovering the parent). */
  async clickSubMenuLink(linkText: string): Promise<void> {
    const link = getLocator(this.page, XPATHS.home.subMenuLink, linkText);
    await link.first().waitFor({ state: 'visible', timeout: 8000 });
    await link.first().click();
  }

  /** Open the site-wide search panel. */
  async openSearch(): Promise<void> {
    // Try aria-label first, then fallback to icon button
    let btn;
    try {
      btn = getLocator(this.page, XPATHS.home.searchBtn, 'Search the site');
      await btn.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      // Fallback: search button may be icon-based or have different structure
      btn = this.page.locator(`xpath=${XPATHS.home.openSearchFallback}`).first();
      await btn.waitFor({ state: 'visible', timeout: 5000 });
    }
    await btn.click();
    await this.page.waitForTimeout(500);
  }

  /** Type a search term into the search panel and submit. */
  async typeSearch(term: string): Promise<void> {
    const input = this.page.locator(`xpath=${XPATHS.home.searchInputFallback}`).first();
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.fill(term);
    await input.press('Enter');
  }

  /** Click the Blackstone logo to navigate back to the homepage. */
  async clickLogoToHome(): Promise<void> {
    const logo = this.page.locator(`xpath=${XPATHS.home.logoToHome}`).first();
    await this.dismissEntryOverlays();
    await logo.waitFor({ state: 'visible', timeout: 6000 });
    try {
      await logo.click();
    } catch {
      // If a late modal backdrop intercepts the click, dismiss overlays and retry once.
      await this.dismissEntryOverlays();
      await logo.click({ force: true });
    }
  }

  // ── Carousel Methods ───────────────────────────────────────────────────────

  /** Return the hero carousel slide-status text, e.g. "slide 1 of 3". */
  async getHeroCarouselStatusText(): Promise<string> {
    const status = this.page.getByText(/slide\s+\d+\s+of\s+\d+/i).first();
    await status.waitFor({ state: 'visible', timeout: 8000 });
    return (await status.textContent())?.trim() ?? '';
  }

  /** Click the "Show Next Slide" carousel button. */
  async clickCarouselNext(): Promise<void> {
    const btn = this.page.getByRole('button', { name: 'Show Next Slide' }).first();
    await btn.scrollIntoViewIfNeeded();
    await btn.waitFor({ state: 'visible', timeout: 8000 });
    await btn.click();
  }

  /** Click the "Show Previous Slide" carousel button. */
  async clickCarouselPrev(): Promise<void> {
    const btn = this.page.getByRole('button', { name: 'Show Previous Slide' }).first();
    await btn.scrollIntoViewIfNeeded();
    await btn.waitFor({ state: 'visible', timeout: 8000 });
    await btn.click();
  }

  // ── Private Wealth Methods ─────────────────────────────────────────────────

  /** Scroll to the Private Wealth section. */
  async scrollToPrivateWealth(): Promise<void> {
    const sectionMarker = this.page.getByText('Private wealth', { exact: true }).first();
    await sectionMarker.waitFor({ state: 'attached', timeout: 8000 });
    await sectionMarker.scrollIntoViewIfNeeded();
  }

  /** Click the first private wealth featured link by href fragment (e.g. "breit.com"). */
  async clickPrivateWealthLink(hrefFragment: string): Promise<void> {
    const link = getLocator(this.page, XPATHS.home.linkByHref, hrefFragment);
    await scrollIntoView(link.first());
    await link.first().click();
  }

  // ── Featured Stories Methods ───────────────────────────────────────────────

  /** Scroll to the Featured Stories section. */
  async scrollToFeaturedStories(): Promise<void> {
    const heading = this.page.getByRole('heading', { name: /Featured Stories/i }).first();
    await heading.waitFor({ state: 'attached', timeout: 8000 });
    await heading.scrollIntoViewIfNeeded();
  }

  /** Return the Featured Stories section heading locator. */
  async getFeaturedStoriesHeading(): Promise<Locator> {
    return this.page.getByRole('heading', { name: /Featured Stories/i }).first();
  }

  /** Story cards – `<article>` elements in the featured/stories/insights section. */
  async getStoryCards(): Promise<Locator> {
    return this.page.locator(`xpath=${XPATHS.home.featuredStoriesCards}`);
  }

  /** Story images – `<img>` elements in the featured/stories/insights section. */
  async getStoryImages(): Promise<Locator> {
    return this.page.locator(`xpath=${XPATHS.home.featuredStoriesImages}`);
  }

  /** Story dates – `<time>` or date-classed elements in the featured/stories section. */
  async getStoryDates(): Promise<Locator> {
    return this.page.locator(`xpath=${XPATHS.home.featuredStoriesDates}`);
  }

  /** Story insight links inside the featured stories section. */
  async getStoryLinks(): Promise<Locator> {
    return this.page.locator(`xpath=${XPATHS.home.featuredStoriesLinks}`);
  }

  // ── Footer Form Methods ────────────────────────────────────────────────────

  /** Scroll to the footer email-capture form. */
  async scrollToFooterForm(): Promise<void> {
    const emailField = getLocator(this.page, XPATHS.home.inputByPlaceholder, 'Email Address *');
    await scrollIntoView(emailField);
  }

  /** Fill an input identified by its placeholder attribute. */
  async fillFormField(placeholder: string, value: string): Promise<void> {
    const field = getLocator(this.page, XPATHS.home.inputByPlaceholder, placeholder);
    const count = await field.count();
    const fieldToUse = count > 1 ? field.first() : field;
    await fieldToUse.waitFor({ state: 'visible', timeout: 8000 });
    await fieldToUse.fill(value);
  }

  /** Click the Submit button to trigger form validation. */
  async triggerCountryValidation(): Promise<void> {
    const submitBtn = this.page.locator(`xpath=${XPATHS.home.submitButton}`).first();
    await submitBtn.waitFor({ state: 'visible', timeout: 8000 });
    await submitBtn.click();
  }

  /** Select a country by its display label. */
  async selectCountry(countryName: string): Promise<void> {
    // The actual input is aria-hidden; the visible control is the combobox wrapper.
    const countryDropdown = this.page.locator(`xpath=${XPATHS.home.countryCombobox}`).first();

    await countryDropdown.waitFor({ state: 'visible', timeout: 8000 });
    await countryDropdown.click();
    await this.page.waitForTimeout(300);

    // Select the visible option label from the custom dropdown list.
    const option = getLocator(this.page, XPATHS.home.countryOptionByLabel, countryName).first();

    await option.waitFor({ state: 'visible', timeout: 8000 });
    await option.click();
    await this.page.waitForTimeout(300);
  }

  /** Check the first consent checkbox in the footer form. */
  async checkConsentCheckbox(): Promise<void> {
    const checkbox = getLocator(this.page, XPATHS.home.checkboxByType, 'checkbox');
    await scrollIntoView(checkbox.first());
    await checkbox.first().check();
  }

  // ── Footer Methods ─────────────────────────────────────────────────────────

  /** Scroll to the page footer. */
  async scrollToFooter(): Promise<void> {
    const footer = this.page.locator(`xpath=${XPATHS.home.footerRoot}`).first();
    await scrollIntoView(footer);
  }

  /** Return a Blackstone branding element in the footer (text or logo). */
  async getFooterBranding(): Promise<Locator> {
    return this.page.locator(`xpath=${XPATHS.home.footerBrandingText}`).first();
  }

  /** Click a footer link by its visible text. */
  async clickFooterLink(linkText: string): Promise<void> {
    const link = getLocator(this.page, XPATHS.home.footerLinkByText, linkText);
    await scrollIntoView(link);
    await link.click();
  }

  /** Return the first anchor in the footer. */
  async getFirstFooterLink(): Promise<Locator> {
    return this.page.locator(`xpath=${XPATHS.home.footerAnyHref}`).first();
  }
}
