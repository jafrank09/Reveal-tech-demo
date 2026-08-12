import { test, expect } from './fixtures/pages.fixture';
import contactData from './data/contact.json';

/**
 * Confirms the Contact form can be filled out and submitted successfully. The only
 * observable confirmation demoblaze.com gives is a native `alert()` dialog — there's
 * no in-page success banner — so the assertion here is on the dialog's message text,
 * captured and returned by HomePage.submitContactForm().
 */
test('submits a contact request successfully', async ({ homePage }) => {
  await homePage.goto();
  await homePage.openContactModal();

  const confirmationMessage = await homePage.submitContactForm(
    contactData.email,
    contactData.name,
    contactData.message
  );

  expect(confirmationMessage).toBe('Thanks for the message!!');
});
