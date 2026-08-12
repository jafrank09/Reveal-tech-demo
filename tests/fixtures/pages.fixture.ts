import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';

type PageFixtures = {
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
};

/**
 * A single fixtures file wires every page object into Playwright's test runner, so
 * spec files never construct a page object directly — they just declare which
 * fixtures they need as test arguments and get a ready-to-use instance. Given this
 * suite only has three page objects, one shared fixture file is simpler to navigate
 * than splitting fixtures per page and keeps all the wiring in one obvious place.
 */
export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});

export { expect } from '@playwright/test';
