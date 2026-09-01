# Task 6 Report — Technical SEO and build verification

## Status

Complete and committed in the nested `website` repository on `local-source`.

- Commit: `9ca038ad480f95a2efcf0a0bb61d2e7b68d0706b`
- Subject: `feat: add SEO metadata and static build gate`
- No remote was added and nothing was pushed.
- The nested worktree is clean.

## RED / GREEN evidence

### Structured-data RED

Command from the workspace root:

```text
pnpm --dir website test -- src/lib/structured-data.test.ts
```

The required initial failure was:

```text
FAIL  src/lib/structured-data.test.ts [ src/lib/structured-data.test.ts ]
Error: Cannot find module './structured-data' imported from /home/bode/sites/loom.dev/website/src/lib/structured-data.test.ts

Test Files  1 failed | 5 passed (6)
     Tests  7 passed (7)
ELIFECYCLE Test failed.
```

### Structured-data GREEN

The same focused command passed after implementing the public helpers:

```text
Test Files  6 passed (6)
     Tests  10 passed (10)
```

The tests use literal expected schema objects at the public helper seams. They
verify the canonical origin, absolute breadcrumb item URLs and positions, and
the absence of ratings, reviews, offers, and prices from SoftwareApplication.

### Build-verifier RED

Command from the workspace root:

```text
node --test website/scripts/verify-build.test.mjs
```

The required initial failure was:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/home/bode/sites/loom.dev/website/scripts/verify-build.mjs'
imported from /home/bode/sites/loom.dev/website/scripts/verify-build.test.mjs

tests 1
pass 0
fail 1
```

### Build-verifier GREEN

The same required Node test command passed after implementation:

```text
✔ website/scripts/verify-build.test.mjs
tests 1
pass 1
fail 0
```

The isolated file contains 13 behavior tests. A direct Node-runner invocation
reported 13 tests: 13 pass, 0 fail. The fixtures begin with a complete valid
build and independently prove rejection of:

- duplicate title elements;
- missing descriptions;
- canonical URLs on another origin;
- broken internal links;
- multiple H1 elements;
- malformed JSON-LD;
- missing CNAME;
- missing sitemap index;
- an incorrect robots sitemap declaration;
- a stacks page with 30 cards;
- a noindex page included in the sitemap; and
- CLI violations with process exit status 1.

Vitest initially auto-discovered the mandated Node-runner filename and reported
it as an empty Vitest suite. `vitest.config.ts` now excludes only
`scripts/verify-build.test.mjs`, leaving that file to `node --test`. The final
full Vitest run passes all six Vitest files and ten tests.

## Implementation and integration edits

- Added `organizationJsonLd()`, `softwareApplicationJsonLd()`, and
  `breadcrumbsJsonLd(items)` with canonical `https://loom-dev.xyz` URLs.
- MarketingLayout now emits Organization and SoftwareApplication JSON-LD on
  Home, Features, Teams, and Stacks. The homepage's previous inline product
  object was removed so the shared helper is the single source of truth.
- DocsLayout now emits BreadcrumbList JSON-LD with absolute Home,
  Documentation, and current-guide URLs.
- JSON-LD contains no ratings, reviews, offers, or price fields; the verifier
  also rejects those properties recursively if introduced later.
- Added the exact CNAME, favicon, 1200×630 social card, and exact robots endpoint
  pointing at `https://loom-dev.xyz/sitemap-index.xml`.
- Added a custom one-H1 404 page using the shared design shell with
  `noindex, nofollow`; the sitemap excludes it.
- SeoHead now references the SVG favicon. Its existing canonical social image
  reference now resolves to the generated `social-card.svg` artifact.
- Added an offline Cheerio verifier exporting `verifyBuild(distDir)` and a CLI.
  It recursively reads only generated HTML for page checks and never executes
  scripts or makes network requests.
- The verifier enforces exactly one non-empty title, description, canonical, and
  H1 per page; globally unique values; self-referencing canonical URLs on the
  exact origin; logical heading order; parseable JSON-LD; valid normalized
  internal targets; exact CNAME and robots sitemap; required favicon/social
  assets; sitemap-index child existence; an exact sitemap-to-indexable-canonical
  page set; 31 stack cards; and a custom noindex 404.

## Full build evidence

The first wrapper run caught one TypeScript inference error in DocsLayout:

```text
src/layouts/DocsLayout.astro:27:68 - error ts(2322):
Type '`/${string}`' is not assignable to type '"/" | "/docs/"'.

Result (38 files):
- 1 error
- 0 warnings
- 0 hints
```

The breadcrumb array was explicitly typed with the exported `BreadcrumbItem`
interface. The final clean verification ran:

```text
pnpm --dir website check
pnpm --dir website build
```

Final exact results:

```text
Result (39 files):
- 0 errors
- 0 warnings
- 0 hints

Test Files  6 passed (6)
     Tests  10 passed (10)

[build] 13 page(s) built in 1.52s
[build] Complete!
Verified static build at /home/bode/sites/loom.dev/website/dist
```

The full build generated the custom 404, all eight docs pages, four marketing
pages, `robots.txt`, `sitemap-index.xml`, `sitemap-0.xml`, CNAME, favicon, and
social card without network validation.

## Generated-output evidence

- `dist/CNAME` bytes are exactly `loom-dev.xyz\n`.
- `dist/robots.txt` exactly declares the canonical sitemap-index URL.
- The child sitemap has the 12 canonical indexable pages and excludes `/404/`.
- Generated marketing pages contain Organization and SoftwareApplication.
- All eight generated docs pages contain BreadcrumbList with absolute items.
- `dist/stacks/index.html` contains exactly 31 `data-stack-card` markers.
- `dist/404.html` contains `noindex, nofollow` and one H1.
- `dist/favicon.svg` and `dist/social-card.svg` both exist.

## Files

Created:

- `website/public/CNAME`
- `website/public/favicon.svg`
- `website/public/social-card.svg`
- `website/scripts/verify-build.mjs`
- `website/scripts/verify-build.test.mjs`
- `website/src/lib/structured-data.ts`
- `website/src/lib/structured-data.test.ts`
- `website/src/pages/404.astro`
- `website/src/pages/robots.txt.ts`
- `website/vitest.config.ts`

Modified:

- `website/src/components/SeoHead.astro`
- `website/src/layouts/DocsLayout.astro`
- `website/src/layouts/MarketingLayout.astro`
- `website/src/pages/index.astro`

## Self-review

- `git diff --check` passed before commit.
- Checked the generated schemas rather than source strings: all expected schema
  types are present on their intended route families.
- Confirmed no rating, review, offer, or price properties in generated JSON-LD.
- Confirmed all generated canonical URLs use the exact HTTPS origin and are
  self-referencing.
- Confirmed heading order and exactly one H1 across every generated HTML file.
- Confirmed all same-origin anchor targets resolve after trailing-slash
  normalization.
- Confirmed sitemap contents equal the set of canonical pages without noindex.
- Confirmed the verifier CLI uses exit status 1 for violations and remains
  importable without running the CLI.
- Confirmed the nested repository is clean after the local commit.

## Concerns

None. The static release gate is offline and all required checks pass.

---

## Review follow-up — robots, schema contracts, and diagnostics

Addressed both Important review findings and the two related Minor robustness
findings in a focused verifier follow-up. Existing generated behavior remains
unchanged; the static gate now protects it more precisely.

- Follow-up commit: `3699529cc253ff37081220259283213beb273c9f`
- Subject: `fix: harden static SEO verification`
- No remote was added and nothing was pushed.

### Focused RED

The pre-agreed seam remained `verifyBuild(distDir)`. The valid fixture was
expanded to represent all four marketing routes and a docs route, then eight
new rejection cases were added before implementation:

- nested JSON-LD `@type` values for `Review`, the absolute
  `https://schema.org/Offer`, and `AggregateRating`;
- crawl-blocking robots directives with the otherwise-correct sitemap URL;
- a marketing page missing Organization and SoftwareApplication;
- a docs page missing BreadcrumbList; and
- duplicate title and description diagnostics that must name both involved
  source HTML files.

Command:

```text
node --test scripts/verify-build.test.mjs
```

Initial result:

```text
✖ scripts/verify-build.test.mjs
tests 1
pass 0
fail 1
```

The direct Node test reporter exposed the exact fixture results:

```text
tests 21
pass 13
fail 8
```

The eight failures were exactly the three prohibited `@type` fixtures, exact
robots-content fixture, two route-aware schema fixtures, and two duplicate-file
diagnostic fixtures. The prohibited entities were placed under a nested
`mainEntity` while valid Organization and SoftwareApplication types remained,
so those tests cannot pass merely because route-level schema validation fails.

### Focused GREEN

Implemented:

- byte-for-byte comparison with the approved robots text:
  `User-agent: *`, `Allow: /`, one blank line, the exact canonical Sitemap line,
  and a final newline;
- recursive JSON-LD inspection across arrays, objects, `@graph`-style shapes,
  nested entities, plain schema type names, absolute schema URLs, and `@type`
  arrays;
- rejection of Offer, Review, and Rating entity families expressed through
  `@type`, in addition to prohibited rating/review/offer/price properties;
- required Organization and SoftwareApplication types for `/`, `/features/`,
  `/teams/`, and `/stacks/`;
- required BreadcrumbList for `/docs/` and every nested docs route; and
- duplicate value groups that report every involved source file.

The first full build after this implementation supplied another useful RED:

```text
Build verification failed:
- 404.html contains prohibited JSON-LD property operatingSystem.
- features/index.html contains prohibited JSON-LD property operatingSystem.
- index.html contains prohibited JSON-LD property operatingSystem.
- stacks/index.html contains prohibited JSON-LD property operatingSystem.
- teams/index.html contains prohibited JSON-LD property operatingSystem.
ELIFECYCLE Command failed with exit code 1.
```

This showed that substring matching for `rating` was too broad because
`operatingSystem` contains the same character sequence. `operatingSystem` was
added to the valid SoftwareApplication fixture first; the focused command then
failed. Matching was narrowed to actual schema property names and entity type
suffixes, preserving the required prohibition without rejecting valid product
metadata.

Final focused commands:

```text
node --test scripts/verify-build.test.mjs
node scripts/verify-build.test.mjs
pnpm test -- src/lib/structured-data.test.ts
```

Final exact results:

```text
✔ scripts/verify-build.test.mjs
tests 1
pass 1
fail 0

tests 21
pass 21
fail 0

Test Files  6 passed (6)
     Tests  10 passed (10)
```

### Full verification GREEN

Commands from the workspace root:

```text
pnpm --dir website check
pnpm --dir website build
```

Final exact results:

```text
Result (39 files):
- 0 errors
- 0 warnings
- 0 hints

Test Files  6 passed (6)
     Tests  10 passed (10)

[build] 13 page(s) built in 1.54s
[build] Complete!
Verified static build at /home/bode/sites/loom.dev/website/dist
```

### Follow-up files

- Modified `website/scripts/verify-build.mjs`.
- Modified `website/scripts/verify-build.test.mjs`.

### Follow-up self-review

- `git diff --check` passed.
- The exact robots comparison rejects crawl blocking, unexpected directives,
  whitespace drift, wrong sitemap URLs, and extra sitemap declarations.
- Route-aware validation reads parsed JSON-LD types, not raw source strings, and
  accepts plain names and absolute schema.org type URLs.
- Nested forbidden-type fixtures retain all required marketing types, isolating
  recursive entity rejection from route-family assertions.
- Valid SoftwareApplication `operatingSystem` metadata has explicit regression
  coverage and passes generated-output verification.
- Duplicate title and description tests require the diagnostic to contain both
  `features/index.html` and `index.html`.
- The final build remains offline and verifies the real 13-page generated site.

### Follow-up concerns

None.
