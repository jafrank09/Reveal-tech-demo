import { Page, Locator } from '@playwright/test';
import { captureDialogMessage } from '../utils/dialogs';

/**
 * Models an individual product detail page (prod.html?idp_=<id>). Content here is
 * rendered client-side after an XHR call rather than present on initial page load,
 * so read methods rely on Playwright's built-in actionability waits (via innerText)
 * rather than assuming the DOM is already populated.
 */
export class ProductPage {
  private readonly page: Page;
  private readonly productName: Locator;
  private readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productName = page.locator('.name');
    this.addToCartButton = page.getByRole('link', { name: 'Add to cart' });
  }

  /** innerText (rather than textContent) waits for the element to actually be
   * rendered/visible, which matters here since the title is filled in asynchronously. */
  async getProductName(): Promise<string> {
    return (await this.productName.innerText()).trim();
  }

  /**
   * Adds the current product to the cart. The site confirms this with a native
   * `alert()` reading "Product added" instead of any visible in-page toast — there is
   * no DOM element to assert against, so the dialog's message text is captured (via
   * the shared captureDialogMessage helper — see tests/utils/dialogs.ts for why a
   * plain click-then-await-dialog sequence isn't safe here) and handed back to the
   * caller to assert on at the test level.
   */
  async addToCart(): Promise<string> {
    return captureDialogMessage(this.page, () => this.addToCartButton.click());
  }
}
