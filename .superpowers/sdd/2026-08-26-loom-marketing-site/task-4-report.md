# Task 4 Report — Canonical Stacks Page

## RED

- Added `website/src/lib/stacks.test.ts` against the public `publicStacks()` seam.
- Ran `pnpm --dir website test -- src/lib/stacks.test.ts` before implementation.
- Result: FAIL — `Cannot find module './stacks' imported from website/src/lib/stacks.test.ts`.

## GREEN

- Implemented `publicStacks()` from `@loom/stacks` `stackDefinitions`; IDs and runtime images are directly derived from the canonical definitions, sorted by ID.
- Added server-rendered `StackCard` and progressively enhanced `StackFilter` components, plus `/stacks/`.
- Rendered all 31 cards in the static HTML before JavaScript; filtering adds search/category filtering, live result count, clear action, and no-results state after enhancement only.
- Applied the existing Terminal Editorial tokens: 70rem content width, 38.75rem prose width, terminal-style runtime details, visible keyboard focus, and the shared reduced-motion rule.

## Exact checks

| Check | Result |
| --- | --- |
| `pnpm --dir website test -- src/lib/stacks.test.ts` (RED) | FAIL — adapter module missing |
| `pnpm --dir website test -- src/lib/stacks.test.ts` (GREEN) | PASS — 4 files, 4 tests |
| `pnpm --dir website check` | PASS — Astro: 0 errors, 0 warnings, 0 hints; Vitest: 4 files, 4 tests |
| `pnpm exec astro build` (from `website`) | PASS — `/stacks/index.html` generated |
| `grep -o 'data-stack-card' dist/stacks/index.html \| wc -l` (from `website`) | PASS — `31` |
| `grep -o '<h1' dist/stacks/index.html \| wc -l` (from `website`) | PASS — `1` |
| `git diff --check` (from `website`) | PASS |

## Files

- Created `website/src/lib/stacks.ts`
- Created `website/src/lib/stacks.test.ts`
- Created `website/src/components/StackCard.astro`
- Created `website/src/components/StackFilter.astro`
- Created `website/src/pages/stacks.astro`
- Updated `website/src/styles/global.css`

## Self-review

- `publicStacks()` consumes only `stackDefinitions` for public stack IDs and runtime image data; the starter-ID set is limited to category classification and is not a duplicate complete registry.
- The page has one H1. Every card is present in the initial server response and exposes `data-stack-card`, `data-category`, stack ID, label, and runtime images as readable text.
- The filter never hides content until its client script runs. It uses native controls, a live status region, disabled/enabled clear action, explicit no-results copy, and existing focus/reduced-motion styling.
- No Task 6-owned social-card asset or full build-wrapper verifier was added or changed.

## Concern

- The brief's exact `grep -c 'data-stack-card' website/dist/stacks/index.html` returns `1`, because Astro minifies the generated static document onto one physical line. The semantically correct occurrence assertion, recorded above, returns `31`; the rendered document contains all 31 cards before JavaScript executes.
