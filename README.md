# UI Automation Project - Blackstone.com

Professional Playwright + TypeScript UI automation test suite for blackstone.com homepage testing.

## Project Structure

```
ui-automation-project/
├── pages/              # Page Object Model classes
│   ├── BasePage.ts     # Base class for common functionality
│   └── HomePage.ts     # Homepage-specific interactions
├── tests/              # Test specifications
│   ├── header.spec.ts  # Header navigation tests (3 tests)
│   ├── body.spec.ts    # Body content tests (3 tests)
│   └── footer.spec.ts  # Footer interaction tests (3 tests)
├── utils/              # Shared utilities
│   └── helpers.ts      # XPath parameterization & scroll helpers
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── .gitignore
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm 8+

### Installation

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in headed mode (visible browser)
npm run test:headed

# Run specific test file
npm run test:header
npm run test:body
npm run test:footer

# View HTML report
npm run test:report
```

## Architecture & Best Practices

### Page Object Model (POM)

All page interactions are encapsulated in page object classes:

- **BasePage**: Common functionality (navigation, overlay dismissal)
- **HomePage**: Homepage-specific selectors and methods

Benefits:
- Maintainability: Selectors defined in one place
- Reusability: Methods shared across tests
- Readability: Tests focus on behavior, not selectors

### XPath Parameterization

All selectors use parameterized XPath templates:

```typescript
// Template with PARAM placeholder
readonly xpPrimaryNavLink = "//*[contains(@class,'primary-nav')]//a[normalize-space(text())='PARAM']";

// Usage
const link = getLocator(page, this.xpPrimaryNavLink, "The Firm");
// Resolves to: //*[contains(@class,'primary-nav')]//a[normalize-space(text())='The Firm']
```

Benefits:
- Single selector definition for multiple values
- Reduced code duplication
- Easier maintenance

### Error Handling

All async operations use try-catch to handle flaky scenarios:

```typescript
try {
  await overlay.click();
} catch {
  // Overlay not present - continue
}
```

Benefits:
- Robust tests that don't fail on optional elements
- Graceful handling of page state variations
- Better error resilience

### Constants for Magic Numbers

All timeouts and delays are defined as class constants:

```typescript
private static readonly OVERLAY_TIMEOUT_MS = 10000;
private static readonly OVERLAY_DELAY_MS = 800;
```

Benefits:
- Centralized configuration
- Easy adjustment without code changes
- Clear intent of timeout purposes

### Strict Mode Compliance

All selectors handle Playwright's strict mode:

```typescript
const count = await locator.count();
if (count > 1) {
  await locator.first().scrollIntoViewIfNeeded();  // Use .first() for multiple matches
}
```

## Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Header   | 3     | ✅ Passing |
| Body     | 3     | ✅ Passing |
| Footer   | 3     | ✅ Passing |
| **Total** | **9** | **✅ Passing** |

### Test Cases

#### Header Tests
- **TC_HDR_001**: Validate header navigation links are visible and clickable
- **TC_HDR_002**: Validate header dropdown navigation
- **TC_HDR_003**: Validate search functionality

#### Body Tests
- **TC_BODY_001**: Validate hero carousel navigation
- **TC_BODY_002**: Validate Private Wealth section
- **TC_BODY_003**: Validate Featured Stories section

#### Footer Tests
- **TC_FTR_001**: Validate footer form field population
- **TC_FTR_002**: Validate footer branding
- **TC_FTR_003**: Validate footer links

## Configuration

### playwright.config.ts

- **Timeout**: 120s per test (accounts for network latency)
- **Retries**: 0 (ensures fast feedback; tests are deterministic)
- **Parallelization**: Disabled (prevents resource contention)
- **Viewport**: 1280x720 (fixed for consistency)

### tsconfig.json

- **Target**: ES2020
- **Module**: NodeNext (ESM)
- **Strict**: Enabled (strict type checking)

## Best Practices Applied

### 1. Type Safety
- Full TypeScript strict mode
- No `any` types
- Proper error typing

### 2. Code Organization
- Clear separation of concerns (Pages vs Tests)
- Logical grouping of selectors and methods
- Single responsibility principle

### 3. Documentation
- JSDoc comments on all public methods
- Inline comments for complex logic
- README with clear instructions

### 4. Error Handling
- Graceful degradation for optional elements
- Try-catch around all async operations
- Meaningful error messages

### 5. Maintainability
- Parameterized selectors
- Constants for configuration
- DRY (Don't Repeat Yourself) principle

### 6. Performance
- No unnecessary waits
- Fail-fast on errors
- No retries (fast feedback)

## Troubleshooting

### Test Timeout
If a test times out:
1. Check network connectivity to blackstone.com
2. Verify overlay dismissal is working (cookie/geo dialogs)
3. Increase timeout in playwright.config.ts if needed

### Element Not Found
If a selector isn't finding elements:
1. Run in headed mode: `npm run test:headed`
2. Add `page.pause()` to debug page state
3. Use Playwright Inspector: `PWDEBUG=1 npm test`

### Flaky Tests
If tests are intermittent:
1. Add explicit waits for dynamic elements
2. Check for optional overlays in test setup
3. Verify page load state with `waitForLoadState()`

## Contributing

When adding new tests:

1. **Use Page Object Model**: Create methods in HomePage/BasePage
2. **Follow Naming Conventions**: Methods start with verb (get/click/scroll/fill)
3. **Use Constants**: Define all timeouts as class constants
4. **Add Documentation**: JSDoc comments on new methods
5. **Handle Errors**: Wrap operations in try-catch
6. **Test Locally**: Run full suite before committing

## Files & Structure

### Generated Files (Ignored)
- `test-results/` - Test execution artifacts
- `playwright-report/` - HTML test report
- `node_modules/` - Dependencies

See `.gitignore` for full list.

## License

ISC

---

**Last Updated**: 2026-06-28
**Status**: ✅ All Tests Passing (9/9)
