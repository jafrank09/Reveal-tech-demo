import { test, expect } from './fixtures/pages.fixture';
import checkoutData from './data/checkout.json';

/**
 * Covers the full happy-path purchase flow: find a product, add it to the cart,
 * fill out the order form, and confirm the purchase succeeds. Assertions live here
 * rather than inside the page objects, so the page objects stay reusable by any
 * future test that wants the same actions without the same expectations.
 * We should eventually put these assertion strings into a shared json data file, similar to our
 * categories.json file, to avoid duplication. For the sake of brevity, I have opted to leave them here.
 */
test('completes a full order checkout', async ({ homePage, productPage, cartPage }) => {
  await homePage.goto();
  await homePage.openProduct(checkoutData.product.name);
  expect(await productPage.getProductName()).toBe(checkoutData.product.name);

  const addToCartMessage = await productPage.addToCart();
  expect(addToCartMessage).toBe('Product added');

  await cartPage.goto();
  const cartTitles = await cartPage.getCartItemTitles();
  expect(cartTitles).toContain(checkoutData.product.name);
  expect(await cartPage.getTotal()).toBe(String(checkoutData.product.price));

  await cartPage.openPlaceOrderModal();
  await cartPage.fillOrderForm(checkoutData.order);
  await cartPage.submitOrder();

  const confirmation = await cartPage.getConfirmation();
  expect(confirmation.title).toBe('Thank you for your purchase!');
  expect(confirmation.text).toContain(`Amount: ${checkoutData.product.price} USD`);
  expect(confirmation.text).toContain(`Name: ${checkoutData.order.name}`);

  await cartPage.acknowledgeConfirmation();
});
