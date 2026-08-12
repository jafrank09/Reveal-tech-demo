import { Page } from '@playwright/test';

/**
 * Triggers an action that opens a native browser dialog (e.g. alert()), accepts it,
 * and returns its message text. Used by both ProductPage and HomePage, since
 * demoblaze.com confirms actions this way instead of with a DOM element.
 *
 * Awaiting the trigger and the dialog together (rather than one after the other)
 * matters because a synchronous alert() blocks the page until dismissed — awaiting
 * the trigger first would deadlock waiting for a dialog it's blocking.
 */
export async function captureDialogMessage(page: Page, trigger: () => Promise<void>): Promise<string> {
  let message = '';
  const dialogHandled = new Promise<void>((resolve) => {
    page.once('dialog', async (dialog) => {
      message = dialog.message();
      await dialog.accept();
      resolve();
    });
  });
  await Promise.all([dialogHandled, trigger()]);
  return message;
}
