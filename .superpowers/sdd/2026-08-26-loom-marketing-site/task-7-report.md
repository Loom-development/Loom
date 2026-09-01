# Task 7 Report: Browser, responsive, and accessibility gates

## Status

DONE

The complete browser/config suite is implemented, the responsive and accessibility
regressions it exposed are fixed, and the full `verify` release gate passes. No
assertions were weakened or skipped because of the host browser environment.

Nested source checkpoint: `ea01f9e` (`test: verify responsive accessible static site`).

## RED

1. Added the required homepage and canonical-stack smoke tests before creating a
   Playwright config.
2. Ran `pnpm --dir website test:e2e`.
3. The command failed as expected: without a Playwright config/test directory it
   discovered the existing Vitest files under `src/` and failed during collection.
4. After adding the representative projects and complete suites, the first runnable
   browser pass exposed real failures:
   - pages had no viewport meta tag, so mobile emulation retained a desktop CSS
     layout;
   - the mobile-scrollable homepage command preview was not keyboard focusable and
     Axe reported `scrollable-region-focusable` at serious impact;
   - Escape closed the mobile header menu without restoring trigger focus;
   - a closed docs control lost focus before the desktop media-query callback could
     transfer it to visible navigation;
   - the copy live region produced the awkward announcement `Copy Install Loom
     copied to clipboard.`;
   - Vitest collected the new Playwright specs during the combined `verify` run.

Test-fixture corrections made during RED were limited to using current Teams copy,
keeping locators stable when their accessible names/visibility change, and stubbing
the clipboard boundary so keyboard activation and the site's live-region behavior
remain deterministic.

## GREEN

Implemented and verified:

- desktop Chromium at `1440x1000`;
- mobile Chromium at `390x844`, including touch/mobile emulation;
- JavaScript-disabled Chromium;
- built Astro preview at `http://127.0.0.1:4321`;
- homepage and 31-stack smoke checks;
- Axe checks on `/`, `/stacks/`, `/teams/`, and `/docs/quick-start/` in desktop and
  mobile projects, rejecting serious or critical violations;
- keyboard order for desktop header navigation, mobile header navigation, docs
  drawer focus trap, copy buttons, stack filtering, and docs previous/next links;
- Escape close and trigger focus restoration for mobile header/docs controls;
- both Task 5 focus paths across the `48rem` breakpoint: open drawer and focused
  closed mobile control;
- no-JavaScript marketing navigation, docs content/sidebar, all 31 stack cards, and
  readable install command;
- mobile horizontal-overflow checks on home, stacks, and quick start, with desktop
  docs sidebar hidden and mobile drawer trigger visible;
- desktop persistent docs sidebar visibility;
- explicit Vitest exclusion for Playwright's `tests/**` ownership boundary.

The browser gate drove five narrow site corrections: viewport metadata, keyboard
focusability for the scrollable command preview, mobile header Escape focus restore,
robust docs focus transfer at the responsive breakpoint, and a grammatical copy
announcement.

## Browser environment diagnostics

No `sudo`, package-manager mutation, system-file writes, or browser-assertion
workarounds were used.

- Playwright browser: `/home/bode/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`
- Browser version: `Google Chrome for Testing 151.0.7922.34`
- Initial `ldd` result: `libnspr4.so`, `libnss3.so`, `libnssutil3.so`, and
  `libsmime3.so` were not found through the host's default linker paths.
- Existing read-only compatible libraries:
  `/snap/chromium/3507/usr/lib/x86_64-linux-gnu`
- With that directory supplied as `LD_LIBRARY_PATH`, `ldd` resolved all four
  libraries and the downloaded Playwright Chromium launched successfully.
- The snap Chromium wrapper itself was not used because it attempted to create
  `/home/bode/snap` and `/run/user/1000/snap.chromium` in read-only locations.
- `pnpm --dir website exec playwright install chromium` completed without a new
  dependency change.
- The restricted command sandbox rejected local bind with `listen EPERM`. A
  read-only elevated diagnostic found an existing Astro preview for this exact
  workspace on port 4321 (`astro ... preview --port 4321 --host 127.0.0.1`). The
  config now reuses an existing local preview but requires a fresh server in CI.

## Exact final results

Command:

```sh
LD_LIBRARY_PATH=/snap/chromium/3507/usr/lib/x86_64-linux-gnu pnpm --dir website verify
```

Result: PASS

- Astro check: 43 files, 0 errors, 0 warnings, 0 hints.
- Vitest: 6 files passed, 10 tests passed.
- Astro static build: 13 pages built.
- Static build verifier: PASS.
- Playwright: 36 scheduled tests; 29 passed and 7 intentional project-specific
  skips (desktop-only tests in mobile and mobile-only tests in desktop); 0 failed.
- The JavaScript-disabled project passed all 4 of its tests.
- Axe passed all 8 route/project combinations with no serious or critical
  violations.

Additional focused/full runs:

- `pnpm --dir website build`: PASS after the responsive/accessibility fixes.
- `LD_LIBRARY_PATH=... pnpm --dir website test:e2e`: PASS with the same 29 passed,
  7 intentional skips, 0 failed result.
- `git -C website diff --check`: PASS.

## Files

Created:

- `website/playwright.config.ts`
- `website/tests/site.spec.ts`
- `website/tests/accessibility.spec.ts`
- `website/tests/no-javascript.spec.ts`

Updated:

- `website/src/components/CommandBlock.astro`
- `website/src/components/SeoHead.astro`
- `website/src/components/SiteHeader.astro`
- `website/src/layouts/DocsLayout.astro`
- `website/src/pages/index.astro`
- `website/vitest.config.ts`

## Concerns

There is no unresolved product or test-suite concern. This particular host still
requires the existing snap NSS/NSPR directory in `LD_LIBRARY_PATH` when launching
the downloaded Playwright Chromium. Standard CI images should install Playwright's
documented system dependencies instead; the repository does not encode this
host-specific path.

---

## Review-finding fix checkpoint

### Status

DONE

Fixed all three review findings against nested source checkpoint `ea01f9e`.

- Command blocks now render readable command text and manual-copy guidance by
  default. The Copy button is hidden until its script confirms clipboard support
  and initializes the live control.
- Stack filter controls are hidden until their script initializes; without
  JavaScript, the page explains that all 31 cards are available and leaves every
  card visible.
- The keyboard test now tabs to the category radio group, uses ArrowRight to
  select Starters, asserts selected state, then asserts the 10-card result.
- Added a mobile JavaScript-disabled Chromium project and docs test for visible
  fallback navigation, visible content, hidden inert drawer control, and no
  horizontal overflow.

### Exact commands and output

```sh
pnpm --dir website build
```

PASS: Astro check reported 43 files with 0 errors, 0 warnings, and 0 hints; the
static build produced 13 pages; the static build verifier passed.

```sh
LD_LIBRARY_PATH=/snap/chromium/3507/usr/lib/x86_64-linux-gnu pnpm --dir website exec playwright test tests/site.spec.ts --grep 'stack filtering is fully keyboard operable'
```

PASS: 2 passed (desktop Chromium and mobile Chromium).

```sh
LD_LIBRARY_PATH=/snap/chromium/3507/usr/lib/x86_64-linux-gnu pnpm --dir website exec playwright test tests/no-javascript.spec.ts
```

PASS: 8 passed, 2 intentional viewport-specific skips. This includes the desktop
sidebar and mobile fallback-navigation docs checks, plus static command/filter
fallback assertions in both disabled-JavaScript projects.

```sh
LD_LIBRARY_PATH=/snap/chromium/3507/usr/lib/x86_64-linux-gnu pnpm --dir website verify
```

PASS:

- Astro check: 43 files, 0 errors, 0 warnings, 0 hints.
- Vitest: 6 files passed, 10 tests passed.
- Astro static build: 13 pages; static build verifier passed.
- Playwright: 42 scheduled tests, 33 passed, 9 intentional project-specific
  skips, 0 failed.

```sh
git -C website diff --check
```

PASS: no whitespace errors.

### Files

Updated:

- `website/src/components/CommandBlock.astro`
- `website/src/components/StackFilter.astro`
- `website/src/styles/global.css`
- `website/playwright.config.ts`
- `website/tests/site.spec.ts`
- `website/tests/no-javascript.spec.ts`

### Self-review

- Confirmed all interactive controls are unavailable rather than inert when
  JavaScript is disabled; their static alternatives retain the core task.
- Confirmed the filter script only reveals controls after it has found all
  required controls and cards.
- Confirmed the Copy control remains keyboard-tested when JavaScript and the
  clipboard API are available.
- Confirmed no host-specific browser-library path was added to tracked project
  configuration.

### Concerns

No product or test-suite concerns remain. The local host still needs the existing
snap NSS/NSPR library directory in `LD_LIBRARY_PATH` to launch Playwright Chromium;
that path is used only in the shell commands above and is not encoded in the repo.
