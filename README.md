# Reveal Tech Demo

A Playwright-based test automation project, built as a technical demo for an interview.

## Overview

This repository is a QA engineering take-home submission covering manual test design, automation judgment, and a working Playwright + TypeScript automation suite against [demoblaze.com](https://www.demoblaze.com/), a public e-commerce demo site.

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

## Manual Test Cases (HLZ Feature)

Manual test design for the HLZ (Helicopter Landing Zone) feature.

### TC-01: Search successfully places HLZ at default diameter

**Preconditions:**

- User is logged into Farsight with a valid session
- A mission/map is open and loaded AND centered on a viewport containing at least one location that satisfies HLZ constraints (clear terrain, no obstructions, etc.)
- HLZ toolbar button is visible AND enabled

**Steps:**

1. Click the **HLZ** toolbar button
2. Observe the diameter slider appears, defaulted to a known value (e.g., 20m, or whatever the required default is)
3. Click **Search**

**Expected Result:**

- System evaluates candidates within the current viewport
- The first suitable candidate identified is selected and rendered as a circular HLZ marker on the map, with diameter matching the slider value
- No error state or "No suitable location" message is shown
- HLZ marker is selectable/editable after placement



### TC-02: Search returns "No suitable location" over unsuitable HLZ terrain

**Preconditions:**

- User is logged into Farsight with a valid session
- A mission/map is open and loaded, with the current viewport containing only unsuitable terrain for an HLZ (e.g., entirely over ocean, mountainous/steep terrain, or other constraint-violating area)
- HLZ toolbar button is visible and enabled

**Steps:**

1. Click the **HLZ** toolbar button
2. Leave the diameter slider at its default value (or set to any valid value within 20–200m)
3. Click **Search**

**Expected Result:**

- System evaluates candidates within the current viewport and finds none that meet the constraints
- A "No suitable location" message is displayed to the user
- No HLZ marker is rendered on the map
- The user is not left in a broken/stuck state — they can adjust the viewport (pan/zoom) or diameter and retry Search



### TC-03: Manually placement HLZ

**Preconditions:**

- User is logged into Farsight with a valid session
- A mission/map is open and loaded
- HLZ toolbar button is visible and enabled

**Steps:**

1. Click the **HLZ** toolbar button
2. Set the diameter slider to a specific value (e.g., 100m)
3. Instead of clicking Search, click directly on a valid location on the map (clear terrain, no obstructions)

**Expected Result:**

- An HLZ circle is rendered centered on the selected point
- The circle's diameter matches the slider value (100m)
- The HLZ marker is selectable/editable after placement
- No "No suitable location" message appears, since this is a manual, NOT searched  placement



### TC-04: With an entirely valid viewport, Search renders exactly one HLZ circle

**Preconditions:**

- User is logged into Farsight with a valid session
- A mission/map is open and loaded, where the entire visible viewport is suitable terrain (no obstructions, water, or slope anywhere, i.e. every point is a technically valid candidate)
- Diameter slider is at its default value (20m)
- HLZ toolbar button is visible and enabled

**Steps:**

1. Click the **HLZ** toolbar button
2. Confirm the diameter slider is at its default (20m)
3. Click **Search**

**Expected Result:**

- Exactly one HLZ circle is rendered on the map
- No other candidate markers, highlighted zones, or additional circles appear anywhere else in the viewport
- The single rendered circle matches the 20m diameter



### TC-05: Android — a pan/scroll gesture never triggers accidental HLZ placement

**Preconditions:**

- User is logged into Farsight on an Android device/tablet with a valid session
- Map is loaded and visible, containing valid terrain
- HLZ toolbar button is visible and enabled, diameter slider set to a valid value

**Steps:**

1. Tap the **HLZ** toolbar button
2. Perform a touch-drag (pan) gesture across the map to reposition the view — touching down on the map, dragging, then lifting
3. After panning, perform a single, deliberate tap on a valid, stationary location on the map

**Expected Result:**

- The pan gesture in step 2 does not place an HLZ, even though it involves a touch-down and touch-up on the map surface
- The deliberate tap in step 3 places an HLZ circle exactly at the tapped location, sized to the current diameter
- No stray or duplicate HLZ markers are created as a side effect of panning/scrolling



## Clarifying Questions (HLZ Feature)

1. **Default diameter on open** — does the slider start at 20m, 200m, or some other system default value when the HLZ tool is first activated? Is that default value hard coded, or should we have a config that an Admin could change on the fly if needed?
2. **Manual placement constraint enforcement** — does manually placing an HLZ on unsuitable terrain (water, steep slope) create a blocked/warning pop up of some kind the user can see? Or is manual override the whole point of that path?
3. **Placement finality** — is a single tap or click FINAL? Or is there a confirm/undo step? Extremely relevant, given the high cost and risk of a mis-placed HLZ in the field.
4. **Behavior with many valid candidates** — is "first candidate found" the intended long-term behavior, or is ranking/filtering multiple valid locations on the roadmap? If so, are those ranking/filtering features hard-coded, or configurable by an admin?
5. **Cross-platform consistency** — for an identical viewport/input, how precisely should we expect HLZ selections to match across Mac, Windows, Android, and Cloud? Is there an acceptable margin of error, in terms of distance, or should the result be identical every time?



## Automation Judgment (HLZ Feature)

Parts of the HLZ feature we might NOT want to fully trust to automation:

1. **Verifying no HLZ is selected when all viewport terrain is ineligible.** We would automate the UI-level regression test (TC-02), but not rely solely on automation for verifying the negative case is correct against real-world terrain:  the consequence of a false negative here (an HLZ shown as safe when it isn't) is severe enough to warrant a human sanity-check against live data, not just pre-defined fixture data, which could change as a result of some upstream service.
2. **Final confirmation to transmit the HLZ to an inbound helicopter.** We would automate assertions around this action: i.e. button state, enabled/disabled conditions, and that the correct payload is sent. But, we would not rely on automation alone to certify that this action works end-to-end in a live or production-like environment. A scripted click passing in a test environment proves the UI behaved correctly; it **doesn't** prove a helicopter crew actually receives a correct, timely signal. My assumption is that this action might put an aircrew and military transport into a potentially hostile zone, which instantlly entails much greater risk and complexity, even if its pre-planned. We'd want a human to manually verify the full signal path, **especially** after any change to how that code/data path might work. The cost of automation giving false confidence here isn't a failed test, it's a life-safety failure in the field.



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

**Tools used:** Claude Code, running inside Cursor.

**Example prompts:**

- The Part 3 kickoff prompt laying out the full framework spec: strict POM pattern, selectors/methods separated from scripts, a single fixture file injecting all page objects, JSON-only test data, assertions kept at the script level, comments justifying design choices, and the three target flows on demoblaze.com.
- A correction mid-brainstorm for a manual test case: *"no thats wrong. I am thinking of a scenario in which there might be valid points outside the area of the chosen circle diameter. We do not want those to render, I assume"* — redirecting the AI after two wrong guesses at what the test case should actually verify.
- *"wait why are we repeating that dialogue-handling logic?"* — it failed to recognize that as an opprotunity to develope a helper funtion, even after explicitly being told to be on the lookout for re-usable code.

**What the AI got wrong:**

- It misread the intent behind one HLZ test case three times when I asked it to edit the language in a row, before understanding my meaning The actual ask was about a fully-valid viewport rendering exactly **one** circle). I had to catch and correct that each time through conversation.
- It failed to be sufficiently DRY when initially writing logic in 2 different page objecty files for nearly identical native dialog handling logic, instead of extracting it into a shared helper. It still technically worked, but that's an obvious opprotunity for not repeating oneself in code. (see helper in`tests/utils/dialogs.ts`.)
- It introduced useless files in an attempt to provide a 'smoother' local testing experience. Neither of these achieved anything of note, and they were deleted and never committed. It wants to 'help' a little too much at times.

