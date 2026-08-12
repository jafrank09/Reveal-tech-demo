# Reveal Tech Demo

A Playwright-based test automation project, built as a technical demo for an interview.

## Overview

This repository showcases a TypeScript + [Playwright](https://playwright.dev/) test automation setup, including cross-browser test execution and CI integration via GitHub Actions.

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

## Project Structure

```
.
├── tests/                  # Playwright test specs
├── playwright.config.ts    # Playwright configuration (browsers, reporters, etc.)
└── .github/workflows/      # CI pipeline definition
```

## Continuous Integration

Tests run automatically on every push and pull request to `main`/`master` via the workflow defined in [.github/workflows/playwright.yml](.github/workflows/playwright.yml). Test reports are uploaded as build artifacts for review.

## Manual Test Cases (HLZ Feature)

Manual test design for the HLZ (Helicopter Landing Zone) feature.

### TC-01: Search successfully places landing zone at default diameter

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

## Status

Initial scaffold — additional test coverage and application-specific scenarios to follow.
