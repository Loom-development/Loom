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

