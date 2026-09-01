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
