import { Page, Locator } from '@playwright/test';

/**
 * Models demoblaze.com's home page (index.html): category navigation, the product
 * grid, and the "Contact" modal (present in the nav on every page, but only ever
 * exercised from here in this suite). Keeping selectors as class fields means a
 * markup change only requires updating this one file, not every spec that touches
 * the home page.
 */
export class HomePage {
  private readonly page: Page;

  // Product cards render as `<a class="hrefch">` inside the grid. Title text is used
  // to find a specific product because it's stable across catalog re-ordering, unlike
  // relying on card position/index.
  private readonly productLink: (productName: string) => Locator;

  private readonly contactNavLink: Locator;
  private readonly contactEmailInput: Locator;
  private readonly contactNameInput: Locator;
  private readonly contactMessageInput: Locator;
  private readonly sendMessageButton: Locator;
  private readonly cartNavLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productLink = (productName: string) => page.locator('.hrefch', { hasText: productName });
    this.contactNavLink = page.getByRole('link', { name: 'Contact' });
    this.contactEmailInput = page.locator('#recipient-email');
    this.contactNameInput = page.locator('#recipient-name');
    this.contactMessageInput = page.locator('#message-text');
    this.sendMessageButton = page.getByRole('button', { name: 'Send message' });
    this.cartNavLink = page.locator('#cartur');
  }

  /** Navigates directly to the home page so every test starts from a known, logged-out state. */
  async goto() {
    await this.page.goto('/index.html');
  }

  /**
   * Filters the product grid by category (e.g. "Phones", "Laptops", "Monitors").
   * The grid re-renders via an XHR call to /bycat rather than a page navigation, so we
   * wait for that network response instead of a fixed timeout — this avoids both a
   * flaky under-wait and a needlessly slow, arbitrary sleep.
   */
  async filterByCategory(categoryDisplayName: string) {
    const response = this.page.waitForResponse(
      (res) => res.url().includes('/bycat') && res.status() === 200
    );
    await this.page.getByRole('link', { name: categoryDisplayName, exact: true }).click();
    await response;
  }

  /**
   * Returns the visible titles of every product card currently in the grid, trimmed.
   * Trimming matters here: the live catalog data occasionally ships a title with a
   * trailing newline (e.g. "Sony vaio i7\n"), and without trimming, an otherwise
   * correct filter result would fail a strict equality/contains check.
   */
  async getVisibleProductTitles(): Promise<string[]> {
    const titles = await this.page.locator('.hrefch').allTextContents();
    return titles.map((title) => title.trim());
  }

  /** Navigates to a product's detail page by clicking its title in the grid. */
  async openProduct(productName: string) {
    await this.productLink(productName).click();
  }

  async openContactModal() {
    await this.contactNavLink.click();
    // Bootstrap's modal fade-in is an animation, not an instant DOM swap; waiting for
    // the first field to be visible avoids racing fill() against that transition.
    await this.contactEmailInput.waitFor({ state: 'visible' });
  }

  /**
   * Fills and submits the Contact form. The site confirms submission with a native
   * browser `alert()` rather than any in-page element — there's nothing to assert
   * against in the DOM, so the dialog's message is captured and returned instead.
   *
   * This alert fires synchronously, blocking the page's JS thread the instant it
   * opens — which means the click() that triggers it won't resolve until the dialog
   * is dismissed. Awaiting the click and the dialog together via Promise.all avoids a
   * deadlock here: page.once fires independent of click()'s own pending await, unlike
   * sequentially awaiting a waitForEvent('dialog') promise after the click, which
   * would never get the chance to call dialog.accept().
   */
  async submitContactForm(email: string, name: string, message: string): Promise<string> {
    await this.contactEmailInput.fill(email);
    await this.contactNameInput.fill(name);
    await this.contactMessageInput.fill(message);

    let confirmationMessage = '';
    const dialogHandled = new Promise<void>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        confirmationMessage = dialog.message();
        await dialog.accept();
        resolve();
      });
    });
    await Promise.all([dialogHandled, this.sendMessageButton.click()]);
    return confirmationMessage;
  }

  async goToCart() {
    await this.cartNavLink.click();
  }
}
