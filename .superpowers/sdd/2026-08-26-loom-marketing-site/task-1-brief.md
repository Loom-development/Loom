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

