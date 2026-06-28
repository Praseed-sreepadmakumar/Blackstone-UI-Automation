import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Blackstone.com UI Automation Tests
 *
 * This config defines:
 * - Test execution parameters (timeout, retries, parallelization)
 * - Browser configuration (viewport, headless mode)
 * - Reporting and diagnostic options (screenshots, videos, traces)
 *
 * Best Practices:
 * - fullyParallel: false - Prevents resource contention on target site
 * - retries: 0 - Allows quick feedback; tests should be deterministic
 * - video/trace: retain-on-failure - Aids debugging without cluttering disk
 */
export default defineConfig({
  testDir: './tests',

  // ── Timeouts ───────────────────────────────────────────────────────────────
  timeout: 120000,  // 120s per test (accounts for network latency)
  expect: {
    timeout: 15000,  // 15s for assertions
  },

  // ── Execution ──────────────────────────────────────────────────────────────
  fullyParallel: false,  // Prevent simultaneous connections to same site
  retries: 0,  // No retries - ensures fast feedback loop
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],  // HTML report
    ['list'],  // Console output
  ],

  // ── Browser Configuration ──────────────────────────────────────────────────
  use: {
    baseURL: 'https://www.blackstone.com',
    headless: true,
    viewport: { width: 1280, height: 720 },  // Fixed viewport for consistency
    screenshot: 'only-on-failure',  // Reduce storage usage
    video: 'retain-on-failure',  // Aid debugging without excess data
    trace: 'retain-on-failure',  // Capture execution trace on failure
  },

  // ── Projects ───────────────────────────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Note: Firefox, WebKit can be added here for cross-browser testing
  ],
});
