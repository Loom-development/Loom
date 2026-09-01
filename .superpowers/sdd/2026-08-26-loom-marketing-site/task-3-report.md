# Task 3 — Marketing pages report

## Outcome

Implemented and committed the approved Terminal Editorial marketing pages in the
nested `website` repository on `local-source`.

- Commit: `4765690 feat: add beginner and team marketing pages`
- No remote was added and nothing was pushed.
- Home, Features, and Teams each have unique metadata, canonical URL, one H1,
  descriptive internal calls to action, and progressive-enhancement-safe command
  blocks.

## RED / GREEN evidence

### RED

Command:

```text
pnpm test -- src/lib/marketing-copy.test.ts
```

Exact relevant output before the data inventory existed:

```text
FAIL  src/lib/marketing-copy.test.ts [ src/lib/marketing-copy.test.ts ]
Error: Cannot find module '../data/marketing-pages' imported from /home/bode/sites/loom.dev/website/src/lib/marketing-copy.test.ts
❯ src/lib/marketing-copy.test.ts:2:1
      1| import { describe, expect, it } from "vitest";
      2| import { marketingPages } from "../data/marketing-pages";
       | ^

Test Files  1 failed | 2 passed (3)
Tests  2 passed (2)
ELIFECYCLE Test failed. See above for more details.
```

### GREEN

Command:

```text
pnpm test -- src/lib/marketing-copy.test.ts
```

Exact final output:

```text
> loom-marketing-site@0.1.0 test /home/bode/sites/loom.dev/website
> vitest run -- src/lib/marketing-copy.test.ts

 RUN  v4.1.11 /home/bode/sites/loom.dev/website

 Test Files  3 passed (3)
      Tests  3 passed (3)
```

The test verifies the required paths in order, unique titles, 120–170 character
descriptions, and absence of prohibited claim patterns from the independent
`marketingPages` copy inventory.

## Final checks and build

Final command:

```text
pnpm check
```

Exact final result:

```text
> loom-marketing-site@0.1.0 check /home/bode/sites/loom.dev/website
> pnpm run build:stacks && astro check && vitest run

> @loom/stacks@0.1.0 build /home/bode/sites/loom.dev/stacks
> pnpm exec tsc -b tsconfig.json

Result (21 files):
- 0 errors
- 0 warnings
- 0 hints

Test Files  3 passed (3)
     Tests  3 passed (3)
```

Final production Astro build command:

```text
pnpm exec astro build
```

Exact final result:

```text
21:31:03 [build] output: "static"
21:31:03 [build] mode: "static"
21:31:03 [build] directory: /home/bode/sites/loom.dev/website/dist/

generating static routes
21:31:03   ├─ /features/index.html
21:31:03   ├─ /teams/index.html
21:31:03   ├─ /index.html
21:31:03 [build] 3 page(s) built in 617ms
21:31:03 [build] Complete!
```

I also inspected generated HTML with Cheerio. All three routes have distinct
titles, descriptions, and self-referencing canonical URLs; each has exactly one
H1 and at least one `/docs/installation/` link.

`pnpm build` was attempted. Astro itself generated all three pages successfully,
then the existing wrapper failed exactly because Task 6 has not yet supplied its
owned verifier:

```text
Error: Cannot find module '/home/bode/sites/loom.dev/website/scripts/verify-build.mjs'
code: 'MODULE_NOT_FOUND'
```

## Files changed

- `website/src/data/marketing-pages.ts`
- `website/src/lib/marketing-copy.test.ts`
- `website/src/components/BenefitGrid.astro`
- `website/src/components/WorkflowSteps.astro`
- `website/src/components/InstallCta.astro`
- `website/src/pages/index.astro`
- `website/src/pages/features.astro`
- `website/src/pages/teams.astro`
- `website/src/styles/global.css`

## Factual-source checks

- Local source, Podman runtime, optional databases, local HTTPS, readiness,
  supported platforms, and the npm install command are supported by `README.md`
  lines 3–17, 23–36, 92–145.
- The 31 versioned-stack proof strip is supported by `docs/architecture.md`
  lines 24–32.
- Safe upgrade, doctor, scoped cleanup, and backup claims are constrained to the
  documented behavior in `README.md` lines 187–244 and
  `docs/architecture.md` lines 48–76.
- Host-aligned writing copy is explicitly limited to supported Linux setups,
  matching `docs/installation.md` lines 83–87.
- Team copy says repository-based project configuration and local repeatability
  only; it does not claim centralized administration, cloud synchronization, or
  enterprise policy features.

## Self-review

- `git diff --check` passed.
- Checked the new page and inventory copy for prohibited testimonials, ratings,
  user counts, pricing, benchmarks, and absolute one-command claims; none are
  present.
- Kept the layout within the shared 70rem page container and prose sections at
  the existing 38.75rem cap. Full-width opt-out was not needed.
- Preserved semantic headings, lists for repeated benefits/workflow steps,
  visible links, existing focus styles, and server-rendered commands.
- Corrected the homepage SoftwareApplication `operatingSystem` metadata to
  include Windows, matching the supported-platform proof strip and repository
  documentation.

## Concern

The full `pnpm build` wrapper cannot pass until Task 6 creates
`website/scripts/verify-build.mjs`; this is an existing planned dependency,
outside Task 3's file ownership. The underlying Astro production build passes.
