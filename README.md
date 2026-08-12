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
- No "No suitable location" message appears, since this is a manual — not searched — placement

### TC-04: With an entirely valid viewport, Search renders exactly one HLZ circle

**Preconditions:**
- User is logged into Farsight with a valid session
- A mission/map is open and loaded, where the entire visible viewport is suitable terrain (no obstructions, water, or slope anywhere — every point is a technically valid candidate)
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

## Status

Initial scaffold — additional test coverage and application-specific scenarios to follow.
