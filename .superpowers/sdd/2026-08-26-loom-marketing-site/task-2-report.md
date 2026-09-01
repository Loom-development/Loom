# Task 2 Report — Design System and Shared Layouts

## Implementation

Implemented the Terminal Editorial shared site shell in `website` and committed it as local checkpoint `6942338` (`feat: add editorial site design system`) on the nested `local-source` branch.

- Added the approved `primaryNavigation` contract, with the exact five public destinations and one focused Vitest specification.
- Added global tokens with every required color, width, and font value; global baseline styles include accessible focus treatment, skip navigation, responsive layouts, and reduced-motion handling.
- Added reusable `SeoHead`, semantic `SiteHeader`/`SiteFooter`, and progressively enhanced `CommandBlock` components.
  - The header uses a real mobile-menu button, `aria-expanded`, document-level Escape close, and leaves navigation visible when JavaScript is unavailable.
  - The command is emitted as `<pre><code>` before its script. Copy feedback uses a polite live region and restores its original button label.
  - The SEO head emits title, description, canonical, robots, theme color, sitemap link, Open Graph/Twitter social image fields, and page-provided JSON-LD. It contains no rating, offer, or review properties.
- Added `MarketingLayout` and `DocsLayout`, both accepting `meta: SitePageMeta`; they share semantic skip-link/header/main/footer structure.
- Added the minimal homepage tracer page with the exact specified metadata, one H1, installation command, Quick Start link, GitHub link, and JSON-LD. No later-page content or backend/runtime behavior was added.

## TDD Evidence

### RED

Command:

```bash
pnpm --dir website test -- src/lib/navigation.test.ts
```

Result: failed as intended because `src/lib/navigation.ts` did not exist:

```text
Error: Cannot find module './navigation' imported from .../src/lib/navigation.test.ts
Test Files  1 failed | 1 passed (2)
```

### GREEN

The same command passed after the minimal navigation implementation:

```text
Test Files  2 passed (2)
Tests  2 passed (2)
```

## Required Verification

```bash
pnpm --dir website check
```

Passed with Astro diagnostics:

```text
Result (14 files):
- 0 errors
- 0 warnings
- 0 hints
Test Files  2 passed (2)
Tests  2 passed (2)
```

```bash
pnpm --dir website exec astro build
```

Passed:

```text
[build] 1 page(s) built in 577ms
[build] Complete!
```

Generated-output inspection passed:

```bash
rg -o '<h1[ >]' website/dist/index.html | wc -l
# 1
rg -n '<link rel="canonical" href="https://loom-dev.xyz/"' website/dist/index.html
# match found
```

`git diff --check` and staged `git diff --cached --check` both passed.

## Files Changed

- `website/src/lib/navigation.ts`
- `website/src/lib/navigation.test.ts`
- `website/src/styles/tokens.css`
- `website/src/styles/global.css`
- `website/src/components/SeoHead.astro`
- `website/src/components/SiteHeader.astro`
- `website/src/components/SiteFooter.astro`
- `website/src/components/CommandBlock.astro`
- `website/src/layouts/MarketingLayout.astro`
- `website/src/layouts/DocsLayout.astro`
- `website/src/pages/index.astro`

## Self-Review

- Confirmed the exact 70rem content and 38.75rem prose tokens, visible `:focus-visible` styles, and reduced-motion rule.
- Confirmed `index.astro` is the sole H1 source in this task and the generated output contains exactly one H1.
- Confirmed canonical origin is exactly `https://loom-dev.xyz/`; no Astro base was added.
- Confirmed navigation is semantic, keyboard-operable, and functional without JavaScript; the client script is enhancement only.
- Confirmed layouts have no analytics, cookies, newsletter, autoplay, or runtime backend behavior.
- Confirmed no unrelated worktree changes were staged; `website` is clean after the checkpoint commit.

## Concerns / Follow-up

- The shared SEO component uses a `/social.png` fallback when a page does not supply `SitePageMeta.image`. This task did not provide or authorize an image asset, so a later content/asset task should supply the real social card (or every page should pass its intended image).
- A rendered desktop/mobile capture was attempted. Playwright Chromium was downloaded after approval, but it cannot launch because the environment lacks `libnspr4.so`; the official `playwright install-deps chromium` command then required an unavailable interactive sudo password. Static build/output verification succeeded, but no visual screenshot evidence is available in this sandbox.
- The anti-UI detector command was run once as required, but its installed wrapper returned `Error: bundled detector not found.` No detector findings could be produced. The implementation instead received the static accessibility/semantic/self-review checks above.

## Review Fix Follow-up

Applied and committed review fixes as local checkpoint `86376c6` (`fix: harden shared layout contracts`).

- `MarketingLayout` now assigns `marketing-main`, whose direct ordinary children receive the 70rem centered content contract. A direct `.full-bleed` child remains deliberately unconstrained, so later pages can add full-viewport bands with their own centered `.container` inner content. The tracer page no longer supplies its own `container`, proving that the layout owns the constraint.
- Changed the SEO fallback from the nonexistent `/social.png` to the Task 6 planned `/social-card.svg`. No asset was added ahead of Task 6.
- Replaced the docs sidebar's pre-content `h2` with a styled paragraph while retaining the `aside`'s accessible `aria-label`, so a slotted docs-page H1 remains the first heading.
- Applied `var(--font-mono)` to command labels.
- When `navigator.clipboard.writeText` is unavailable, the visible Copy button now disables, receives an explanatory accessible label, and reveals a visible instruction to select the still-visible command text and copy it manually.

### Follow-up Verification

```bash
pnpm --dir website test -- src/lib/navigation.test.ts
pnpm --dir website check
pnpm --dir website exec astro build
```

All passed. The focused test reported `2 passed`; Astro check reported `0 errors`, `0 warnings`, and `0 hints`; production build completed with one page.

Static regression assertions confirmed source support for `marketing-main`, `.full-bleed`, `--content-max`, `social-card.svg`, `docs-aside__label`, monospace command labels, and the Clipboard-unavailable fallback. Generated `dist/index.html` contains `og:image` at `https://loom-dev.xyz/social-card.svg` and exactly one H1.

### Follow-up Self-Review

- The shared layout now supplies—not merely documents—the 70rem width guarantee, while `.full-bleed` is a narrow, explicit opt-out.
- The default social URL is forward-compatible with the planned Task 6 asset without prematurely creating an asset.
- The docs label no longer changes the document outline, and the fallback preserves both usable command text and accessible feedback.
- `git diff --check` and staged `git diff --cached --check` passed before the fix commit; the nested `website` worktree is clean afterward.
