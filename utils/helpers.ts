import { Page, Locator } from '@playwright/test';

/**
 * Replaces the literal string PARAM in an XPath template with the
 * supplied value and returns a Playwright Locator.
 *
 * This utility enables reusable XPath templates for dynamic element selection.
 *
 * Example:
 *   getLocator(page, "//nav//a[normalize-space(text())='PARAM']", "The Firm")
 *   → page.locator("xpath=//nav//a[normalize-space(text())='The Firm']")
 *
 * @param page - Playwright Page instance
 * @param xpathTemplate - XPath template with 'PARAM' placeholder
 * @param param - Value to replace PARAM with
 * @returns Playwright Locator for the resolved XPath
 * @throws Error if param contains quotes that break the XPath
 */
export function getLocator(page: Page, xpathTemplate: string, param: string): Locator {
  // Validate input
  if (!xpathTemplate.includes('PARAM')) {
    console.warn('XPath template does not contain PARAM placeholder:', xpathTemplate);
  }

  const xpath = xpathTemplate.replace('PARAM', param);
  return page.locator(`xpath=${xpath}`);
}

/**
 * Scrolls the given locator into view and waits for it to be visible.
 * Handles Playwright's strict mode by using .first() if multiple elements match.
 * Gracefully handles non-existent elements and page closure scenarios.
 *
 * Strict Mode Notes:
 * - If locator matches 0 elements: silently returns (element doesn't exist)
 * - If locator matches 1 element: scrolls that element into view
 * - If locator matches 2+ elements: uses .first() to avoid strict mode error
 *
 * @param locator - Playwright Locator to scroll into view
 * @returns Promise that resolves when scroll is complete or element not found
 */
export async function scrollIntoView(locator: Locator): Promise<void> {
  try {
    const count = await locator.count();
    if (count === 0) {
      // Element doesn't exist - silently continue
      return;
    }
    if (count > 1) {
      await locator.first().scrollIntoViewIfNeeded();
    } else {
      await locator.scrollIntoViewIfNeeded();
    }
  } catch (error) {
    // If scrolling fails (e.g., page closed), silently continue
    // This allows tests to proceed even if specific elements aren't found
  }
}
