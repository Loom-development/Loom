# Loom Marketing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a beginner-friendly, SEO-ready Astro marketing and documentation website for `https://loom-dev.xyz`, keep its source local-only, and safely publish generated files to GitHub Pages.

**Architecture:** A self-contained Astro project lives in ignored `website/`, reads canonical stack data from the local `@loom/stacks` package, and generates static HTML. The source has its own local Git repository with no remote; a guarded deployment script publishes only verified `website/dist/` files to the parent repository's `gh-pages` branch.

**Tech Stack:** Astro 7.2.8, TypeScript 7.0.2, `@astrojs/sitemap` 3.7.3, Vitest 4.1.11, Playwright 1.62.1, `@axe-core/playwright` 4.13.0, pnpm 10.6.5, HTML, CSS, minimal browser JavaScript.

**Spec:** `docs/superpowers/specs/2026-08-26-loom-marketing-site-design.md`

## Global Constraints

- Canonical origin is exactly `https://loom-dev.xyz`; Astro config has no `base` because the custom domain serves from `/`.
- `website/` source and `website/dist/` stay ignored by the parent repository and are never committed to `main`.
- Initialize a nested local Git repository in `website/` with no remote; task commits mentioned below are local recovery points only.
- Never push the website source branch. Deployment publishes only generated `dist/` contents to `gh-pages`.
- Keep the existing local `docs/` directory ignored. Public website documentation lives under `website/src/content/docs/`.
- The site reads public stack IDs from `@loom/stacks`; no second handwritten stack-ID list is allowed.
- Main content max width is `70rem` (1120px); readable prose max width is `38.75rem` (620px).
- Primary audiences are beginners and teams; primary action is Install Loom.
- Use only supported repository facts. Do not invent testimonials, ratings, users, benchmarks, pricing, or absolute one-command claims.
- Terminal Editorial design: near-black, warm white, restrained green, serif display headings, sans-serif body, monospace commands and labels.
- Pages remain understandable without JavaScript; JavaScript only enhances navigation, filtering, and copying.
- WCAG AA contrast, keyboard operation, visible focus, reduced motion, one H1 per page, and logical headings are release requirements.
- Do not add analytics, cookies, newsletters, autoplay media, a runtime backend, or source-driven GitHub Actions deployment.

---

### Task 1: Create the isolated Astro foundation

**Files:**
- Modify: `.gitignore`
- Create: `website/.gitignore`
- Create: `website/package.json`
- Create: `website/pnpm-lock.yaml`
- Create: `website/astro.config.mjs`
- Create: `website/tsconfig.json`
- Create: `website/src/env.d.ts`
- Create: `website/src/lib/site.ts`
- Test: `website/src/lib/site.test.ts`

**Interfaces:**
- Produces: `SITE_ORIGIN`, `SITE_NAME`, `GITHUB_URL`, `NPM_PACKAGE`, and typed `SitePageMeta` for all later pages.
- Produces: local scripts `dev`, `check`, `build`, `preview`, `test`, `test:e2e`, `verify`, `deploy`, and `deploy:publish`.

- [ ] **Step 1: Write the failing site-metadata test**

```ts
import { describe, expect, it } from "vitest";
import { SITE_ORIGIN, pageUrl } from "./site";

describe("site metadata", () => {
  it("uses the approved custom origin without a repository base path", () => {
    expect(SITE_ORIGIN).toBe("https://loom-dev.xyz");
    expect(pageUrl("/docs/quick-start/")).toBe("https://loom-dev.xyz/docs/quick-start/");
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run: `cd website && pnpm exec vitest run src/lib/site.test.ts`

Expected: FAIL because the project and `site.ts` do not exist.

- [ ] **Step 3: Ignore the source from the parent repository and initialize local history**

Add this exact parent ignore rule:

```gitignore
website/
```

Create `website/.gitignore`:

```gitignore
.astro/
dist/
node_modules/
playwright-report/
test-results/
```

Run:

```bash
mkdir website
git -C website init
git -C website branch -M local-source
test -z "$(git -C website remote)"
```

- [ ] **Step 4: Create exact package metadata**

`website/package.json` must contain private package metadata and these exact dependencies:

```json
{
  "name": "loom-marketing-site",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.6.5",
  "engines": { "node": ">=24.0.0" },
  "scripts": {
    "dev": "astro dev",
    "build:stacks": "pnpm --dir .. --filter @loom/stacks build",
    "check": "pnpm run build:stacks && astro check && vitest run",
    "build": "pnpm run build:stacks && astro check && astro build && node scripts/verify-build.mjs",
    "preview": "astro preview",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "verify": "pnpm run check && pnpm run build && pnpm run test:e2e",
    "deploy": "node scripts/deploy.mjs",
    "deploy:publish": "node scripts/deploy.mjs --publish"
  },
  "dependencies": {
    "@astrojs/sitemap": "3.7.3",
    "@loom/stacks": "file:../stacks",
    "astro": "7.2.8"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.10",
    "@axe-core/playwright": "4.13.0",
    "@playwright/test": "1.62.1",
    "cheerio": "1.2.0",
    "typescript": "7.0.2",
    "vitest": "4.1.11"
  }
}
```

Run: `pnpm --dir website install`

Expected: `website/pnpm-lock.yaml` records exact resolutions and local `@loom/stacks` linkage.

- [ ] **Step 5: Configure Astro and implement site metadata**

`astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://loom-dev.xyz",
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap({ namespaces: { news: false, video: false, xhtml: false, image: false } })]
});
```

`src/lib/site.ts`:

```ts
export const SITE_ORIGIN = "https://loom-dev.xyz" as const;
export const SITE_NAME = "Loom" as const;
export const GITHUB_URL = "https://github.com/Loom-development/Loom" as const;
export const NPM_PACKAGE = "@loomdev/cli" as const;
export interface SitePageMeta { title: string; description: string; pathname: `/${string}`; image?: string }
export const pageUrl = (pathname: string) => new URL(pathname, SITE_ORIGIN).href;
```

- [ ] **Step 6: Run GREEN and baseline checks**

Run: `pnpm --dir website check`

Expected: PASS.

- [ ] **Step 7: Commit local source checkpoint**

```bash
git -C website add .
git -C website commit -m "chore: create local Astro site foundation"
```

Do not add a website remote. In the parent repository, stage only `.gitignore` when the user is ready to commit that policy change.

---

### Task 2: Build the design system and shared layouts

**Files:**
- Create: `website/src/styles/tokens.css`
- Create: `website/src/styles/global.css`
- Create: `website/src/components/SiteHeader.astro`
- Create: `website/src/components/SiteFooter.astro`
- Create: `website/src/components/SeoHead.astro`
- Create: `website/src/components/CommandBlock.astro`
- Create: `website/src/layouts/MarketingLayout.astro`
- Create: `website/src/layouts/DocsLayout.astro`
- Create: `website/src/lib/navigation.ts`
- Create: `website/src/pages/index.astro`
- Test: `website/src/lib/navigation.test.ts`

**Interfaces:**
- Consumes: `SitePageMeta`, `SITE_ORIGIN`, `SITE_NAME`, and `GITHUB_URL` from Task 1.
- Produces: `MarketingLayout` and `DocsLayout`, each accepting `meta: SitePageMeta`.
- Produces: `CommandBlock` accepting `label: string`, `code: string`, and optional `language: string`.

- [ ] **Step 1: Write failing navigation and metadata tests**

```ts
import { describe, expect, it } from "vitest";
import { primaryNavigation } from "./navigation";

describe("primary navigation", () => {
  it("exposes the approved public destinations", () => {
    expect(primaryNavigation.map(({ label, href }) => [label, href])).toEqual([
      ["Features", "/features/"], ["Stacks", "/stacks/"], ["Teams", "/teams/"],
      ["Docs", "/docs/"], ["GitHub", "https://github.com/Loom-development/Loom"]
    ]);
  });
});
```

Run: `pnpm --dir website test -- src/lib/navigation.test.ts`

Expected: FAIL because `navigation.ts` is missing.

- [ ] **Step 2: Implement navigation, tokens, and layouts**

Define tokens with these required values:

```css
:root {
  --color-ink: #090d12;
  --color-surface: #0e141b;
  --color-paper: #edf2ee;
  --color-text: #edf5f0;
  --color-muted: #9bada3;
  --color-accent: #6bf0ae;
  --color-rule: #27313a;
  --content-max: 70rem;
  --prose-max: 38.75rem;
  --font-display: Georgia, "Times New Roman", serif;
  --font-body: Inter, ui-sans-serif, system-ui, sans-serif;
  --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}
```

`SeoHead.astro` must render title, description, canonical, robots, Open Graph,
social image, sitemap link, theme color, and JSON-LD passed by the page. It must
not render rating, offer, or review properties.

`SiteHeader.astro` uses a semantic `<nav aria-label="Main navigation">`, a real
button for the mobile menu, `aria-expanded`, Escape-to-close behavior, and a
visible Install Loom link to `/docs/installation/`.

`CommandBlock.astro` renders `<pre><code>` before its enhancement script so the
command remains visible when JavaScript is disabled. Its copy button announces
success with a polite live region and returns to its original label.

- [ ] **Step 3: Create a minimal homepage tracer page**

Render `MarketingLayout` with:

```ts
const meta = {
  title: "Loom — Local Development Environments with Podman",
  description: "Create consistent local development environments with Podman. Keep source files local while Loom runs apps, databases, health checks, and HTTPS.",
  pathname: "/"
} satisfies SitePageMeta;
```

Include one H1, one install command, and links to Quick Start and GitHub. Full
homepage content lands in Task 3.

- [ ] **Step 4: Run GREEN, Astro check, and production build**

Run:

```bash
pnpm --dir website check
pnpm --dir website exec astro build
```

Expected: PASS and `website/dist/index.html` contains the canonical URL and one H1.

- [ ] **Step 5: Commit local source checkpoint**

```bash
git -C website add .
git -C website commit -m "feat: add editorial site design system"
```

---

### Task 3: Write the marketing pages

**Files:**
- Modify: `website/src/pages/index.astro`
- Create: `website/src/pages/features.astro`
- Create: `website/src/pages/teams.astro`
- Create: `website/src/components/BenefitGrid.astro`
- Create: `website/src/components/WorkflowSteps.astro`
- Create: `website/src/components/InstallCta.astro`
- Create: `website/src/data/marketing-pages.ts`
- Test: `website/src/lib/marketing-copy.test.ts`

**Interfaces:**
- Consumes: `MarketingLayout`, `CommandBlock`, and approved navigation.
- Produces: indexable `/`, `/features/`, and `/teams/` pages with unique metadata.
- Produces: `marketingPages`, the shared metadata and searchable copy assertions use as their independent content inventory.

- [ ] **Step 1: Write failing claim and metadata tests**

Create tests that assert:

```ts
expect(marketingPages.map((page) => page.pathname)).toEqual(["/", "/features/", "/teams/"]);
expect(new Set(marketingPages.map((page) => page.title)).size).toBe(3);
for (const page of marketingPages) {
  expect(page.description.length).toBeGreaterThanOrEqual(120);
  expect(page.description.length).toBeLessThanOrEqual(170);
  expect(page.copy).not.toMatch(/trusted by|\d+[,+] users|best-in-class|one command does everything/i);
}
```

Run: `pnpm --dir website test -- src/lib/marketing-copy.test.ts`

Expected: FAIL because `marketingPages` is missing.

- [ ] **Step 2: Implement exact homepage argument**

Use the approved sequence and messages:

1. Eyebrow: `LOCAL DEVELOPMENT, UNTANGLED`
2. H1: `Your whole dev stack. Ready when you are.`
3. Explanation: beginners start without learning container setup; source stays local; Podman runs tools and services.
4. Primary action: `Install Loom`; secondary: `Read the quick start`.
5. Proof strip: `31 versioned stacks`, `Linux · macOS · Windows`, `Powered by Podman`.
6. Benefits: `Files stay yours`, `One setup for the team`, `Services that are ready`.
7. Workflow: `Choose`, `Start`, `Build`.
8. Stack preview linked to `/stacks/`.
9. Team onboarding section linked to `/teams/`.
10. Final Install Loom action.

- [ ] **Step 3: Implement Features and Teams pages**

Features must explain local source, optional databases, readiness, HTTPS,
host-aligned writes, safe upgrade, doctor, clean, and backup in benefit language.
Teams must explain repository-based configuration and repeatable onboarding
without claiming centralized administration, cloud synchronization, or enterprise
policy features Loom does not have.

- [ ] **Step 4: Run tests and build**

Run: `pnpm --dir website check && pnpm --dir website build`

Expected: PASS; three pages have unique title, description, canonical, H1, and internal CTAs.

- [ ] **Step 5: Commit local source checkpoint**

```bash
git -C website add .
git -C website commit -m "feat: add beginner and team marketing pages"
```

---

### Task 4: Generate the canonical Stacks page

**Files:**
- Create: `website/src/lib/stacks.ts`
- Create: `website/src/components/StackCard.astro`
- Create: `website/src/components/StackFilter.astro`
- Create: `website/src/pages/stacks.astro`
- Test: `website/src/lib/stacks.test.ts`

**Interfaces:**
- Consumes: `stackDefinitions` from `@loom/stacks`.
- Produces: `publicStacks(): PublicStack[]`, where `PublicStack` contains `id`, `category`, `runtimeImages`, and a plain-language label.

- [ ] **Step 1: Write failing canonical-registry tests**

```ts
import { describe, expect, it } from "vitest";
import { publicStacks } from "./stacks";

describe("public stacks", () => {
  it("uses every canonical definition exactly once", () => {
    const stacks = publicStacks();
    expect(stacks).toHaveLength(31);
    expect(new Set(stacks.map(({ id }) => id)).size).toBe(31);
    expect(stacks.map(({ id }) => id)).toEqual([...stacks.map(({ id }) => id)].sort());
  });
});
```

Run: `pnpm --dir website test -- src/lib/stacks.test.ts`

Expected: FAIL because the adapter is missing.

- [ ] **Step 2: Implement the registry adapter and categories**

Derive IDs and runtime images only from `stackDefinitions`. Category selection
may use exact typed predicates (`id.startsWith("db-")`, known starter IDs, and
remaining application IDs), but must not duplicate the complete ID list.

Expose readable labels by transforming ID segments, with explicit casing only
for `.NET`, `T3`, `MERN`, `MEAN`, `PHP`, and database product names.

- [ ] **Step 3: Render progressive stack filtering**

Render all 31 cards in HTML with `data-category` and searchable text. The filter
script may hide nonmatching cards only after enhancement. Include a result count,
clear action, no-results message, and an accessible status region.

- [ ] **Step 4: Run tests and JavaScript-free output check**

Run:

```bash
pnpm --dir website check
pnpm --dir website build
grep -c 'data-stack-card' website/dist/stacks/index.html
```

Expected: PASS and count `31` before JavaScript executes.

- [ ] **Step 5: Commit local source checkpoint**

```bash
git -C website add .
git -C website commit -m "feat: generate searchable canonical stack catalog"
```

---

### Task 5: Build task-focused documentation

**Files:**
- Create: `website/src/content.config.ts`
- Create: `website/src/data/docs-navigation.ts`
- Create: `website/src/pages/docs/index.astro`
- Create: `website/src/pages/docs/[...slug].astro`
- Create: `website/src/content/docs/installation.md`
- Create: `website/src/content/docs/quick-start.md`
- Create: `website/src/content/docs/stacks.md`
- Create: `website/src/content/docs/commands.md`
- Create: `website/src/content/docs/existing-projects.md`
- Create: `website/src/content/docs/databases.md`
- Create: `website/src/content/docs/troubleshooting.md`
- Test: `website/src/lib/docs-navigation.test.ts`

**Interfaces:**
- Produces: `docsNavigation` in the exact displayed order above.
- Produces: docs frontmatter schema `{ title, description, order }` with unique positive integer order.
- Consumes: `DocsLayout` and shared command/callout components.

- [ ] **Step 1: Write failing collection and navigation tests**

```ts
expect(docsNavigation.map(({ slug }) => slug)).toEqual([
  "installation", "quick-start", "stacks", "commands",
  "existing-projects", "databases", "troubleshooting"
]);
expect(new Set(docsNavigation.map(({ order }) => order)).size).toBe(7);
```

Run: `pnpm --dir website test -- src/lib/docs-navigation.test.ts`

Expected: FAIL because docs navigation is missing.

- [ ] **Step 2: Define the Astro content collection**

Use Astro 7's `src/content.config.ts`, `glob()` loader, and Zod schema. Reject
empty title/description and non-positive order. The `[...slug].astro` route uses
`getCollection("docs")`, `getStaticPaths()`, and `render()`.

- [ ] **Step 3: Write beginner documentation with verified commands**

Required outcomes:

- Installation covers Node 24+, Podman, conditional OpenSSL, npm, GitHub release installers, and `loom --version`.
- Quick Start covers `init`, optional DB prompt, `start`, printed `:8443` route, hosts/certificate caveats, `status`, and `stop`.
- Stacks explains the categories and links to `/stacks/` rather than maintaining another 31-ID list.
- Commands covers every registered CLI command and uses `loom <command> --help` for option discovery.
- Existing Projects covers `loom adopt [stack]`, preserved files, refusal to overwrite `loom.yaml`, and `start --recreate` after config changes.
- Databases covers optional DB IDs, service-name discovery with `status`, backup support, and SQL Server restore limitation.
- Troubleshooting begins with `podman info`, `loom doctor`, `loom status`, and `loom logs app`; it explains hosts and local certificate warnings.

- [ ] **Step 4: Implement persistent docs navigation**

Desktop sidebar is sticky and marks the current page with `aria-current="page"`.
Mobile uses a button and dialog/drawer pattern, traps focus while open, closes on
Escape, and restores focus. Previous/next links derive from `docsNavigation`.

- [ ] **Step 5: Run docs checks and build**

Run: `pnpm --dir website check && pnpm --dir website build`

Expected: PASS with eight docs routes, unique metadata, sidebar links, and no Edit on GitHub link.

- [ ] **Step 6: Commit local source checkpoint**

```bash
git -C website add .
git -C website commit -m "feat: add beginner-focused Loom documentation"
```

---

### Task 6: Add technical SEO and build verification

**Files:**
- Create: `website/public/CNAME`
- Create: `website/public/favicon.svg`
- Create: `website/public/social-card.svg`
- Create: `website/src/pages/robots.txt.ts`
- Create: `website/src/pages/404.astro`
- Create: `website/src/lib/structured-data.ts`
- Create: `website/scripts/verify-build.mjs`
- Test: `website/src/lib/structured-data.test.ts`
- Test: `website/scripts/verify-build.test.mjs`

**Interfaces:**
- Produces: `organizationJsonLd()`, `softwareApplicationJsonLd()`, and `breadcrumbsJsonLd(items)` returning JSON-serializable objects.
- Produces: `verifyBuild(distDir): Promise<void>` and CLI exit code 1 on violations.

- [ ] **Step 1: Write failing structured-data tests**

```ts
const software = softwareApplicationJsonLd();
expect(software["@type"]).toBe("SoftwareApplication");
expect(software.url).toBe("https://loom-dev.xyz/");
expect(JSON.stringify(software)).not.toMatch(/aggregateRating|review|price/);
```

Run: `pnpm --dir website test -- src/lib/structured-data.test.ts`

Expected: FAIL because helpers are missing.

- [ ] **Step 2: Implement structured data and crawler files**

`CNAME` contains exactly `loom-dev.xyz\n`. `robots.txt.ts` returns:

```text
User-agent: *
Allow: /

Sitemap: https://loom-dev.xyz/sitemap-index.xml
```

Marketing pages include Organization and SoftwareApplication JSON-LD. Docs pages
include BreadcrumbList JSON-LD with absolute URLs.

- [ ] **Step 3: Write failing build-verifier fixture tests**

Fixtures must prove the verifier rejects duplicate titles, missing descriptions,
noncanonical origins, broken internal links, multiple H1s, malformed JSON-LD,
missing CNAME, missing sitemap, and a stacks page with 30 cards.

Run: `node --test website/scripts/verify-build.test.mjs`

Expected: FAIL because verifier is missing.

- [ ] **Step 4: Implement build verification**

Walk only `dist/**/*.html`, parse head/body content without executing scripts,
using Cheerio, normalize trailing-slash links, and verify every internal target against generated
HTML or public files. Require exactly one title, description, canonical, H1, and
valid JSON-LD per page. Require all canonical URLs to start with
`https://loom-dev.xyz/`. Verify CNAME, robots sitemap URL, sitemap index, 31 stack
cards, and the custom 404 file.

- [ ] **Step 5: Run full static verification**

Run: `pnpm --dir website build`

Expected: PASS and no network request is needed to validate generated output.

- [ ] **Step 6: Commit local source checkpoint**

```bash
git -C website add .
git -C website commit -m "feat: add SEO metadata and static build gate"
```

---

### Task 7: Add browser, responsive, and accessibility gates

**Files:**
- Create: `website/playwright.config.ts`
- Create: `website/tests/site.spec.ts`
- Create: `website/tests/accessibility.spec.ts`
- Create: `website/tests/no-javascript.spec.ts`

**Interfaces:**
- Consumes: built Astro output served by `pnpm preview --host 127.0.0.1 --port 4321`.
- Produces: desktop Chromium, mobile Chromium, JavaScript-disabled, keyboard, and Axe checks.

- [ ] **Step 1: Write failing browser smoke tests**

```ts
test("homepage leads beginners to installation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your whole dev stack. Ready when you are.");
  await expect(page.getByRole("link", { name: "Install Loom" }).first()).toHaveAttribute("href", "/docs/installation/");
});

test("stacks page renders every canonical stack", async ({ page }) => {
  await page.goto("/stacks/");
  await expect(page.locator("[data-stack-card]")).toHaveCount(31);
});
```

Run: `pnpm --dir website test:e2e`

Expected: FAIL before Playwright config and preview server exist.

- [ ] **Step 2: Configure representative projects**

Use desktop Chromium at 1440×1000 and mobile Chromium at 390×844. Configure a
web server that runs the already-built static preview. Do not add cross-browser
matrices until the representative gates are stable.

Run once after installing dependencies:

```bash
pnpm --dir website exec playwright install chromium
```

- [ ] **Step 3: Add accessibility and keyboard tests**

Run Axe on `/`, `/stacks/`, `/teams/`, and `/docs/quick-start/` with no serious
or critical violations. Tab through header navigation, mobile menu, docs drawer,
copy buttons, filter, and previous/next links. Assert Escape closes drawers and
focus returns to their trigger.

- [ ] **Step 4: Add JavaScript-disabled and responsive tests**

With `javaScriptEnabled: false`, assert marketing navigation works, docs content
and sidebar links remain visible, all 31 stack cards render, and command text is
readable. On mobile, assert no horizontal page overflow and no desktop sidebar.

- [ ] **Step 5: Run the complete site gate**

Run: `pnpm --dir website verify`

Expected: PASS for type/content checks, unit tests, build verifier, browser smoke,
accessibility, responsive, and no-JavaScript behavior.

- [ ] **Step 6: Commit local source checkpoint**

```bash
git -C website add .
git -C website commit -m "test: verify responsive accessible static site"
```

---

### Task 8: Implement guarded generated-only deployment

**Files:**
- Create: `website/src/lib/deploy.ts`
- Create: `website/scripts/deploy.mjs`
- Test: `website/src/lib/deploy.test.ts`

**Interfaces:**
- Produces: `validateDeployment({ distDir, repository, branch }): Promise<DeploymentInventory>`.
- Produces: dry-run `pnpm --dir website deploy` and explicit publish `pnpm --dir website deploy:publish`.

- [ ] **Step 1: Write failing deployment-safety tests**

Cover these exact refusals:

```ts
await expect(validateDeployment({ distDir: missing, repository: expectedRepo, branch: "gh-pages" })).rejects.toThrow(/missing build output/i);
await expect(validateDeployment({ distDir, repository: "https://github.com/other/repo.git", branch: "gh-pages" })).rejects.toThrow(/unexpected repository/i);
await expect(validateDeployment({ distDir, repository: expectedRepo, branch: "main" })).rejects.toThrow(/unexpected branch/i);
```

Also reject symlinks, missing `CNAME`, incorrect CNAME content, missing `index.html`,
missing sitemap, and any source file extension `.astro` or `.ts` in the payload.

- [ ] **Step 2: Run RED**

Run: `pnpm --dir website test -- src/lib/deploy.test.ts`

Expected: FAIL because deployment helpers are missing.

- [ ] **Step 3: Implement dry-run inventory**

The default command runs `pnpm build`, validates every output path, prints sorted
relative files plus total bytes, and exits without invoking `git push`. It uses
the exact target repository `https://github.com/Loom-development/Loom.git` and
branch `gh-pages`.

- [ ] **Step 4: Implement explicit publish mode**

Only `--publish` may push. It must:

1. Confirm the parent repository's `origin` resolves to the approved Loom repo.
2. Create a new `mkdtemp` directory.
3. Clone existing `gh-pages` into that temporary directory, or initialize an
   orphan `gh-pages` branch when the remote branch does not exist.
4. Remove files only inside the validated temporary checkout.
5. Copy verified `dist/` contents, including dotfiles and `CNAME`.
6. Commit with `site: deploy <UTC timestamp>`.
7. Push a normal fast-forward `HEAD:gh-pages`; never use `--force`.
8. Always remove the exact temporary checkout in `finally`.
9. Leave the parent working tree and nested website source repository unchanged.

- [ ] **Step 5: Test dry run and local bare-remote publishing**

Create a temporary bare Git repository in the test, publish twice, and assert:

- only generated files appear on `gh-pages`;
- second publish is a descendant of the first;
- source files never appear;
- main/source working trees retain identical status before and after;
- no force push is used.

Run: `pnpm --dir website test -- src/lib/deploy.test.ts`

Expected: PASS without external network access.

- [ ] **Step 6: Run complete gate and deployment dry run**

Run:

```bash
pnpm --dir website verify
pnpm --dir website deploy
git status --short
git -C website status --short
```

Expected: all checks pass; dry run lists only generated assets; both working trees
are clean except the parent's intentional `.gitignore` policy change if uncommitted.

- [ ] **Step 7: Commit local source checkpoint**

```bash
git -C website add .
git -C website commit -m "feat: add guarded GitHub Pages deployment"
```

Do not run `deploy:publish` until the user separately authorizes the external push.

---

### Task 9: Final content, visual, and release verification

**Files:**
- Modify only files identified by failed verification within `website/`
- Verify: parent `.gitignore`
- Verify: `website/` local Git history and absence of remotes

**Interfaces:**
- Consumes: complete website and deployment dry run.
- Produces: verified local site ready for an explicitly authorized `gh-pages` publish.

- [ ] **Step 1: Run all automated gates from a clean local website commit**

```bash
test -z "$(git -C website status --short)"
test -z "$(git -C website remote)"
pnpm --dir website verify
pnpm --dir website deploy
```

Expected: PASS and no push.

- [ ] **Step 2: Inspect production output**

Confirm archive inventory contains HTML routes, hashed CSS/JS where applicable,
icons, social image, CNAME, robots, and sitemap. Confirm it contains no `.astro`,
TypeScript source, tests, node_modules, local Git data, lockfile, or source Markdown.

- [ ] **Step 3: Perform fresh-reader testing**

Give a fresh reader only the built site and ask them to:

1. Explain Loom in one sentence.
2. Install it.
3. Create, open, and stop a Node project.
4. Find a Python or WordPress stack.
5. Configure an existing project.
6. Add and back up PostgreSQL.
7. Diagnose a failed start.

Fix only factual or navigation gaps, rerun `pnpm --dir website verify`, and create
one final local website commit.

- [ ] **Step 4: Verify parent repository privacy boundary**

```bash
git check-ignore -q website/package.json
test -z "$(git ls-files website)"
git status --short
```

Expected: website source is ignored and absent from the parent index. Only the
intentional `.gitignore` change may remain for a parent commit.

- [ ] **Step 5: Record DNS and Pages activation handoff**

Before the first authorized publish, the user must:

1. Configure GitHub Pages to serve the `gh-pages` branch root.
2. Configure the apex/custom-domain DNS for `loom-dev.xyz` according to GitHub's
   current Pages domain instructions.
3. Run `pnpm --dir website deploy:publish` only after reviewing the dry-run list.
4. Enable Enforce HTTPS after GitHub provisions the certificate.
5. Verify `https://loom-dev.xyz`, canonical metadata, sitemap, and 404 behavior.

Do not perform DNS changes or the external publish without explicit user authorization.
