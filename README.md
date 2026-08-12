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

## Status

Initial scaffold — additional test coverage and application-specific scenarios to follow.
