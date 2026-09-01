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

