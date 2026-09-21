# Tech Demo

A Playwright-based test automation project, built as a technical demomonstration of a small automation framework for a web application.

## Overview

This repository is a working Playwright + TypeScript automation suite for testing against [demoblaze.com](https://www.demoblaze.com/), a public e-commerce demo site.

## Tech Stack

- [Playwright](https://playwright.dev/) (`@playwright/test`)
- TypeScript
- GitHub Actions for CI

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm

### Installation

```bash
npm install
npx playwright install --with-deps
```



### Running Tests

```bash
# Run all tests headlessly
npx playwright test

# Run tests with the Playwright UI mode
npx playwright test --ui

# Run tests in headed mode
npx playwright test --headed

# View the HTML report from the last run
npx playwright show-report
```

On failure, a screenshot and a trace are captured automatically (see `playwright.config.ts`) and written to `test-results/<spec-name>-<test-title>-<browser>/`, e.g. `test-results/order-checkout-completes-a-full-order-checkout-chromium/`, containing `test-failed-1.png` and `trace.zip`. Open a trace with:

```bash
npx playwright show-trace test-results/<failed-test-folder>/trace.zip
```



## Project Structure

```
.
├── tests/
│   ├── pages/               # Page objects — selectors and actions, one class per page
│   │   ├── HomePage.ts
│   │   ├── ProductPage.ts
│   │   └── CartPage.ts
│   ├── fixtures/
│   │   └── pages.fixture.ts # Single fixture file: wires page objects into every test
│   ├── utils/
│   │   └── dialogs.ts        # Shared helper: reused by ProductPage and HomePage
│   ├── data/                 # Test data (JSON), imported by spec files — kept out of the specs themselves
│   │   ├── checkout.json
│   │   ├── contact.json
│   │   └── categories.json
│   ├── order-checkout.spec.ts
│   ├── category-filter.spec.ts
│   └── contact-request.spec.ts
├── playwright.config.ts      # Playwright configuration (browsers, reporters, trace/screenshot capture)
└── .github/workflows/        # CI pipeline definition
```

## Continuous Integration

Tests run automatically on every push and pull request to `main`/`master` via the workflow defined in [.github/workflows/playwright.yml](.github/workflows/playwright.yml). Test reports are uploaded as build artifacts for review.

## Automated Test Suite ([demoblaze.com](http://demoblaze.com))

Three automated tests against [demoblaze.com](https://www.demoblaze.com/), built with a page object model.

### Architecture

- **Page objects** (`tests/pages/`) — one class per page (`HomePage`, `ProductPage`, `CartPage`). Selectors are private fields; the only public surface is a small set of action/getter methods. Specs never touch a selector directly.
- **Single fixture file** (`tests/fixtures/pages.fixture.ts`) — extends Playwright's base `test` with `homePage`, `productPage`, and `cartPage` fixtures, so every spec just declares the page objects it needs as test arguments instead of constructing them.
- **JSON data files** (`tests/data/`) — product names, prices, form values, and category expectations live in JSON, imported by whichever spec needs them. Selectors stay in the page objects; everything else lives in data.
- **Shared utility** (`tests/utils/dialogs.ts`) — `ProductPage` and `HomePage` both need to handle a native browser dialog with the same non-obvious timing logic (see below), so that logic is a single exported function instead of being duplicated across both page objects.
- **Assertions live in the specs**, not the page objects — page object methods perform actions and return values; `expect()` calls happen only in the `*.spec.ts` files.



### Popup handling helper (`captureDialogMessage`)

"Add to cart" and the Contact form confirm via native browser `alert()` dialogs instead of any DOM element or redirect. These two alerts fire on different timing (one blocks the page synchronously, the other only after a network call resolves), so a naive click-then-await-dialog sequence would deadlock on one and miss the other. `tests/utils/dialogs.ts`'s `captureDialogMessage()` handles both cases correctly and is shared by `ProductPage.addToCart()` and `HomePage.submitContactForm()`.

Purchase confirmation is different: it renders as a SweetAlert DOM modal, not a native dialog, so it's asserted on like any other element.

### The three tests

1. `order-checkout.spec.ts` — full happy-path purchase: find a product, add it to the cart, verify the cart total, fill out and submit the order form, and confirm the purchase succeeds.
2. `category-filter.spec.ts` — selecting a category (Laptops) narrows the product grid down to only that category's products.
3. `contact-request.spec.ts` — the Contact form can be filled out and submitted successfully.



## AI Usage

**Tools used:** Claude Code, running inside Cursor. Below is proof of a successful test run.

![Screenshot 2026-08-12 at 4 35 44 PM](https://github.com/user-attachments/assets/5ec7cbe7-22c0-4f30-9e31-191ffd006507)