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

