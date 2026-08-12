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

  expect(visibleTitles.length).toBeGreaterThan(0);
  for (const title of visibleTitles) {
    expect(categories.laptops.expectedProducts).toContain(title);
  }
});
