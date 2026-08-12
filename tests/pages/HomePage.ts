import { Page, Locator } from '@playwright/test';
import { captureDialogMessage } from '../utils/dialogs';

/**
 * Models demoblaze.com's home page (index.html): category navigation, the product
 * grid, and the "Contact" modal. Keeping selectors as class fields means a markup
 * change only requires updating this one file, not every spec that touches the home
 * page.
 *
 * Note: the Contact modal is technically a separate concern from the home page — it's
 * actually present in the nav on every page (prod.html, cart.html), not just this one.
 * A larger suite would likely pull it into its own ContactModal component page object
 * shared across pages. It's kept here instead because this suite only ever exercises
 * it from the home page, and splitting it out wouldn't pay for itself at this scope.
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
   * against in the DOM, so the dialog's message is captured (via the shared
   * captureDialogMessage helper — see tests/utils/dialogs.ts for why a plain
   * click-then-await-dialog sequence isn't safe here) and returned instead.
   */
  async submitContactForm(email: string, name: string, message: string): Promise<string> {
    await this.contactEmailInput.fill(email);
    await this.contactNameInput.fill(name);
    await this.contactMessageInput.fill(message);

    return captureDialogMessage(this.page, () => this.sendMessageButton.click());
  }

  async goToCart() {
    await this.cartNavLink.click();
  }
}
