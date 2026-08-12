import { Page, Locator } from '@playwright/test';

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
   * no DOM element to assert against, so the dialog's message text is captured and
   * handed back to the caller to assert on at the test level.
   *
   * Unlike the contact form's alert (fires synchronously, blocking the page's JS
   * thread the instant it opens), this one fires only after an async /addtocart
   * network call resolves — so click() itself returns quickly, before the dialog
   * exists. Awaiting the click and the dialog together via Promise.all handles both
   * timing shapes correctly: it won't return early on a delayed dialog, and it won't
   * deadlock on an immediate/blocking one (page.once fires independent of click()'s
   * own pending await, unlike sequentially awaiting a waitForEvent('dialog') promise
   * after the click, which would deadlock against a same-tick blocking dialog).
   */
  async addToCart(): Promise<string> {
    let message = '';
    const dialogHandled = new Promise<void>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        message = dialog.message();
        await dialog.accept();
        resolve();
      });
    });
    await Promise.all([dialogHandled, this.addToCartButton.click()]);
    return message;
  }
}
