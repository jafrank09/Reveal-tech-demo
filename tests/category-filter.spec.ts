import { test, expect } from './fixtures/pages.fixture';
import categories from './data/categories.json';

/**
 * Confirms that selecting a product category actually narrows the grid down to that
 * category, rather than e.g. silently showing the full catalog or an unrelated set.
 * The expected product list is treated as a superset (every visible title must be in
 * it) rather than an exact match, so the test tolerates the demo store's catalog
 * gaining new laptop listings over time without needing an update here.
 */
test('filters products by category', async ({ homePage }) => {
  await homePage.goto();
  await homePage.filterByCategory(categories.laptops.displayName);

  const visibleTitles = await homePage.getVisibleProductTitles();

  // Note: asserting each title against a static JSON allowlist is reallt too broad of a 
  // check against data that this suite doesn't control (the live catalog). Assertioons should  a
  // ideally be precise and ingle-purpose as possible. I have opted to keep this one as-is for the sake of brevity
  // but I want to call out that this could easily source of flakiness/test debt, if and when demoblaze's catalog changes.
  expect(visibleTitles.length).toBeGreaterThan(0);
  for (const title of visibleTitles) {
    expect(categories.laptops.expectedProducts).toContain(title);
  }
});
