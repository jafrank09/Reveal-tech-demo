import { Page, Locator } from '@playwright/test';

export type OrderDetails = {
  name: string;
  country: string;
  city: string;
  card: string;
  month: string;
  year: string;
};

/**
 * Models the shopping cart (cart.html) and the "Place order" modal that lives on the
 * same page. Both are grouped into one page object because the modal is only ever
 * reachable from the cart itself — splitting it into a second class would add an
 * import for every checkout test without adding any real separation of concerns.
 */
export class CartPage {
  private readonly page: Page;
  private readonly cartItemTitles: Locator;
  private readonly totalPrice: Locator;
  private readonly placeOrderButton: Locator;

  private readonly nameInput: Locator;
  private readonly countryInput: Locator;
  private readonly cityInput: Locator;
  private readonly cardInput: Locator;
  private readonly monthInput: Locator;
  private readonly yearInput: Locator;
  private readonly purchaseButton: Locator;

  // The purchase confirmation renders via SweetAlert, a DOM-based modal (unlike the
  // add-to-cart/contact confirmations, which are native browser alert() dialogs), so
  // it's read and asserted on like any other element rather than via page.on('dialog').
  private readonly confirmationTitle: Locator;
  private readonly confirmationText: Locator;
  private readonly confirmationOkButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItemTitles = page.locator('#tbodyid tr td:nth-child(2)');
    this.totalPrice = page.locator('#totalp');
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });

    this.nameInput = page.locator('#name');
    this.countryInput = page.locator('#country');
    this.cityInput = page.locator('#city');
    this.cardInput = page.locator('#card');
    this.monthInput = page.locator('#month');
    this.yearInput = page.locator('#year');
    this.purchaseButton = page.getByRole('button', { name: 'Purchase' });

    this.confirmationTitle = page.locator('.sweet-alert h2');
    this.confirmationText = page.locator('.sweet-alert p');
    this.confirmationOkButton = page.locator('.sweet-alert button.confirm');
  }

  /** Navigates directly to the cart so tests don't depend on nav-link state from a prior step. */
  async goto() {
    await this.page.goto('/cart.html');
  }

  /**
   * Returns cart line-item titles, trimmed for the same reason as HomePage's product
   * titles (stray whitespace in the catalog data). Rows populate asynchronously — one
   * XHR per cart item — so this waits for the first row before reading. That means it
   * assumes a non-empty cart, which holds for every test in this suite that calls it.
   */
  async getCartItemTitles(): Promise<string[]> {
    await this.cartItemTitles.first().waitFor({ state: 'visible' });
    const titles = await this.cartItemTitles.allTextContents();
    return titles.map((title) => title.trim());
  }

  /** The total starts empty and is filled in asynchronously as each cart item's XHR
   * resolves, so this waits for non-empty text rather than reading whatever's there
   * the instant the locator resolves. */
  async getTotal(): Promise<string> {
    await this.page.waitForFunction(() => {
      const el = document.querySelector('#totalp');
      return !!el && el.textContent!.trim().length > 0;
    });
    return (await this.totalPrice.innerText()).trim();
  }

  async openPlaceOrderModal() {
    await this.placeOrderButton.click();
    await this.nameInput.waitFor({ state: 'visible' });
  }

  /** Fills every field in the "Place order" modal from a single data object, so the
   * method signature doesn't need to change if we add more fields to the fixture data later. */
  async fillOrderForm(order: OrderDetails) {
    await this.nameInput.fill(order.name);
    await this.countryInput.fill(order.country);
    await this.cityInput.fill(order.city);
    await this.cardInput.fill(order.card);
    await this.monthInput.fill(order.month);
    await this.yearInput.fill(order.year);
  }

  async submitOrder() {
    await this.purchaseButton.click();
  }

  /** Reads the SweetAlert confirmation's title and body text together, since a test
   * asserting on the purchase outcome will typically want both in one call. */
  async getConfirmation(): Promise<{ title: string; text: string }> {
    await this.confirmationTitle.waitFor({ state: 'visible' });
    return {
      title: (await this.confirmationTitle.innerText()).trim(),
      text: (await this.confirmationText.innerText()).trim(),
    };
  }

  async acknowledgeConfirmation() {
    await this.confirmationOkButton.click();
  }
}
