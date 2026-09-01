# Task 8 Report: Guarded Generated-Only Deployment

## Outcome

Implemented a generated-only GitHub Pages deployment boundary for the exact approved repository `https://github.com/Loom-development/Loom.git` and exact branch `gh-pages`. The default script builds, validates, inventories, and stops without running Git. Explicit publish support exists but was exercised only against a temporary local bare repository; no external publish was run and no remote was added to the nested `website` repository.

The supported pnpm command forms are:

- Dry run: `pnpm --dir website run deploy`
- Explicit publish: `pnpm --dir website run deploy:publish`

pnpm 10.6.5 reserves bare `pnpm deploy` as its own workspace-deployment command. As confirmed by the controller, the explicit `run` form is therefore the callable interface. Direct evidence: `pnpm --dir website deploy` exited with `ERR_PNPM_NOTHING_TO_DEPLOY`; it did not invoke the package script.

## RED / GREEN

### RED

Command:

```text
pnpm --dir website test -- src/lib/deploy.test.ts
```

Initial result: failed before test execution because `src/lib/deploy.ts` did not exist:

```text
Error: Cannot find module './deploy'
Test Files 1 failed | 6 passed (7)
```

After the validation slice was green, the local-publish tracer test produced the second intended RED:

```text
TypeError: publishDeployment is not a function
Test Files 1 failed | 6 passed (7)
Tests 1 failed | 21 passed (22)
```

### GREEN

Final focused command:

```text
pnpm --dir website test -- src/lib/deploy.test.ts
```

Final result:

```text
Test Files 7 passed (7)
Tests 23 passed (23)
```

The tests cover missing build output, wrong repository, wrong branch, symlinks, missing or incorrect `CNAME`, missing `index.html`, missing sitemap, `.astro` and `.ts` source payloads, deterministic inventory and byte totals, wrong parent origin, and the two-publish local bare-remote workflow.

## Local Bare-Remote Publish Evidence

The integration test creates a temporary bare Git repository and uses Git's test-only `url.*.insteadOf` configuration to route the still-exact approved HTTPS URL to it. It publishes exactly twice and asserts:

- the first push creates `gh-pages`;
- the second commit is a descendant of the first;
- the second subject is exactly `site: deploy 2026-08-27T09:01:00.000Z`;
- the resulting tree is exactly `.nojekyll`, `CNAME`, `assets/site.css`, `index.html`, and `sitemap-index.xml`;
- source files are absent;
- parent and nested source status strings are identical before and after;
- a Git wrapper's argument log contains neither `--force` nor `-f`;
- `/tmp/loom-deploy-*` contents are identical before and after, proving the `finally` cleanup removed both temporary checkouts.

No real origin was contacted by this test.

## Full Verification

Final full command:

```text
LD_LIBRARY_PATH=/tmp/loom-playwright-libs-task8.h5Waxu/nspr/usr/lib/x86_64-linux-gnu:/tmp/loom-playwright-libs-task8.h5Waxu/nss/usr/lib/x86_64-linux-gnu pnpm --dir website verify
```

The temporary library path was needed because the host lacked Chromium's `libnspr4.so` and `libnss3.so`; the Debian packages were downloaded and extracted under `/tmp` without modifying the host package database, then the exact temporary directory was removed after the final gate.

Final result:

```text
Astro check: 0 errors, 0 warnings, 0 hints
Vitest: 7 files passed, 23 tests passed
Static build: 13 pages built; generated build verified
Playwright: 33 passed, 9 viewport-intentional skipped
Exit code: 0
```

Formatting and diff checks also passed:

```text
pnpm --dir website exec prettier --check src/lib/deploy.ts src/lib/deploy.test.ts scripts/deploy.mjs
git -C website diff --check
```

The nested website lockfile audit was run at its actual independent boundary:

```text
pnpm --dir website --ignore-workspace audit
No known vulnerabilities found
```

For completeness, `pnpm --dir website audit` without `--ignore-workspace` followed the parent workspace and reported pre-existing advisories in unrelated root lint/test and application dependencies. Those are outside Task 8 and were not mutated.

## Default Dry-Run Evidence

Command:

```text
pnpm --dir website run deploy
```

Result: exit code 0 after a fresh build. It printed 20 deterministically sorted generated files totaling `157023` bytes, including `CNAME`, `index.html`, `sitemap-0.xml`, and `sitemap-index.xml`, with no source extensions. Final line:

```text
Dry run complete; no Git push was invoked. Use deploy:publish only with explicit authorization.
```

Status before and after remained:

```text
parent:  M .gitignore
nested: ?? scripts/deploy.mjs
        ?? src/lib/deploy.test.ts
        ?? src/lib/deploy.ts
```

The parent `.gitignore` change predated Task 8. Generated `dist/` and test output remained ignored.

## Safety Reasoning

- Exact repository, branch, and `CNAME` values are constants and are validated at the public boundary.
- The build-output root is checked with `lstat`; every descendant is walked without following symlinks. Non-file/non-directory entries and source extensions are rejected.
- Required top-level `CNAME`, `index.html`, and `sitemap-index.xml` files are enforced; `CNAME` must contain exactly `loom-dev.xyz` plus one newline.
- The parent must be the resolved Git top level and its local `remote.origin.url` must be the exact approved HTTPS URL.
- Git is invoked with argument arrays through `execFile`; no shell interpolation is used by production code.
- Publishing creates a fresh `mkdtemp` root. The checkout's real path must be its direct child before any removal occurs.
- Removal iterates only direct entries in that validated checkout, preserves `.git`, and verifies each resolved removal target has the checkout as its parent.
- The payload is validated twice. Copying uses the validated inventory, rejects unresolved segments, opens sources with `O_NOFOLLOW`, checks file type and byte size, and creates destinations exclusively.
- `git ls-files` must exactly match the inventory before commit, so stale/source files cannot remain in the branch tree. Dotfiles are included.
- Existing `gh-pages` history is cloned before replacement. Push is the normal `HEAD:refs/heads/gh-pages` refspec with no force option; concurrent non-fast-forward updates fail closed.
- Commit subjects use an ISO UTC timestamp. The temporary root is removed in `finally` through an exact `/tmp/loom-deploy-*` guard.
- All mutating Git and filesystem work occurs in the temporary checkout. Tests prove both parent and nested worktrees retain identical status.

## Files

- `website/src/lib/deploy.ts` — validation, inventory, guarded publish, Git and temporary-path boundaries.
- `website/scripts/deploy.mjs` — build/inventory dry-run CLI and explicit `--publish` gate.
- `website/src/lib/deploy.test.ts` — refusal, inventory, parent-origin, and two-publish integration coverage.

## Self-Review

- Confirmed no `--force`, force refspec (`+`), shell command execution, broad recursive deletion target, unresolved environment-variable deletion target, remote addition to `website`, or external push.
- Confirmed dotfiles, stale-file deletion, branch ancestry, commit timestamp, final cleanup, deterministic inventory sorting, and exact staged-tree matching.
- Confirmed production code does not write to the parent or nested source repositories.
- Confirmed only the three intended nested files are staged for the checkpoint.

## Concerns / Handoff

- GitHub Pages and the custom domain are not configured yet, per the user's update. This implementation intentionally makes no Pages or DNS changes.
- `deploy:publish` must not be run against the real origin until the user separately authorizes the external push and the final handoff covers Pages/DNS setup.
- Operators must use pnpm's explicit `run` form because `deploy` is a pnpm 10.6.5 built-in command.
- Nested checkpoint commit: `055cc53 feat: add guarded GitHub Pages deployment`.

## Review Fixes: Content Snapshots, CLI Entry Proof, and Force-Refspec Evidence

### Focused RED

The first review regression run added SHA-256 and copy-race expectations before implementation:

```text
pnpm --dir website test -- src/lib/deploy.test.ts
Test Files 1 failed | 6 passed (7)
Tests 3 failed | 22 passed (25)
```

The failures were exact:

- the `index.html` inventory digest was `undefined`;
- `copyValidatedDeployment` did not exist for same-size content replacement;
- `copyValidatedDeployment` did not exist for an intermediate directory replaced by a symlink.

The CLI entry-path regression then executed `scripts/deploy.mjs` with no arguments and a boundary fake for `pnpm`. The mandatory build ran, but the inherited build marker was absent because `execFile` did not support the supplied `stdio: "inherit"` option:

```text
Test Files 1 failed | 6 passed (7)
Tests 1 failed | 25 passed (26)
AssertionError: expected '' to contain 'inherited build output'
```

### Focused GREEN

Final focused command:

```text
pnpm --dir website test -- src/lib/deploy.test.ts
```

Final result:

```text
Test Files 7 passed (7)
Tests 26 passed (26)
```

Review coverage now proves:

- every inventory file includes a SHA-256 digest of validated bytes;
- same-size content replacement after validation is refused;
- an intermediate source directory replaced by a symlink is refused even when its file bytes match;
- source files are opened with `O_NOFOLLOW`, the opened descriptor resolves to the exact expected path, every intermediate directory is rechecked, and only bytes matching the validated size and digest are copied;
- `CNAME` retains its exact `loom-dev.xyz\n` content check and is also bound to its validated digest;
- destination components are required to remain real directories and destination files are created exclusively with `O_NOFOLLOW`;
- the no-argument `scripts/deploy.mjs` entry path invokes exactly `pnpm build`, inherits its output, emits the exact sorted generated inventory and byte total, prints the dry-run message, and never invokes the Git boundary;
- the production build launcher uses `spawn` with inherited stdio and explicit error/close handling;
- both the first and second local bare-remote commit trees are inspected and contain only `.nojekyll`, `CNAME`, `assets/site.css`, `index.html`, and `sitemap-index.xml`;
- the Git argument log contains exactly two publish calls, both `push origin HEAD:refs/heads/gh-pages`;
- tests reject any force flag and any leading-`+` force refspec form.

Formatting and static checks after the review fixes:

```text
pnpm --dir website exec prettier --check src/lib/deploy.ts src/lib/deploy.test.ts scripts/deploy.mjs
All matched files use Prettier code style!

pnpm --dir website check
Astro: 0 errors, 0 warnings, 0 hints
Vitest: 7 files passed, 26 tests passed
```

### Review Full Verification

The host still lacked Chromium's NSS/NSPR runtime libraries. The two Debian packages were downloaded and extracted only beneath `/tmp/loom-playwright-libs-task8-review.XIKQSB`, supplied through `LD_LIBRARY_PATH` for the gate, and the exact temporary directory was removed afterward. The host package database was not changed.

```text
pnpm --dir website verify
Astro: 0 errors, 0 warnings, 0 hints
Vitest: 7 files passed, 26 tests passed
Static build: 13 pages built; generated build verified
Playwright: 33 passed, 9 viewport-intentional skipped
Exit code: 0
```

### Review Default Dry Run

```text
pnpm --dir website run deploy
```

Result: exit code 0. The command visibly ran the mandatory build, verified the static output, printed 20 deterministically sorted generated files totaling `157023` bytes, and ended with:

```text
Dry run complete; no Git push was invoked. Use deploy:publish only with explicit authorization.
```

Parent and nested status output was identical before and after. Before the final local commit, the parent was clean and the nested repository contained only the intended `src/lib/deploy.test.ts` assertion delta.

### Review Self-Review and Concurrent User State

- Rechecked content-digest comparison, descriptor target verification, intermediate component checks, exact `CNAME`, exclusive destination creation, exact staged inventory, and cleanup guards.
- Rechecked that production publishing still uses only the normal `HEAD:refs/heads/gh-pages` refspec and contains no force flag or leading `+`.
- Rechecked the real no-argument CLI entry rather than only a helper seam.
- No dependency or lockfile changed.
- During the review, the user created and committed the content-snapshot and CLI changes and added the nested origin. Per controller instruction, that history and remote were preserved exactly: no fetch, push, remote edit/removal, reset, rebase, amend, or history rewrite was performed by this agent.
- No external deployment or Git publishing command was run by this agent. All publish executions remained the two existing temporary local bare-repository test publishes.

User-owned/local commit sequence from the original Task 8 checkpoint through the review assertions:

```text
055cc53 feat: add guarded GitHub Pages deployment
f8c08e7 publish
a034e82 update
505d1b4 update
bbd15a3 update
50190b8 update
```

Final review checkpoint commit:

```text
84306c4 test: reject all force deployment refspecs
```

## Review Fix Round 2: Portable Immutable Snapshot

This section supersedes the earlier `/proc/self/fd` and double-validation copy description. Deployment validation now captures the exact verified file bytes, mode, size, and SHA-256 digest in a private snapshot. The exported inventory contains only `path`, `bytes`, and `sha256`; raw buffers are not exposed. Publishing writes only those captured bytes into the validated temporary checkout and never reopens `dist` after validation.

### Round 2 RED

The local bare-remote publish test first gained a post-validation seam which rewrote `dist/index.html` with same-size hostile content and replaced the intermediate `dist/assets` directory with a symlink to an outside directory. Before the seam and snapshot implementation were wired together, the focused run failed exactly because the callback never ran:

```text
pnpm test -- src/lib/deploy.test.ts
Test Files 1 failed | 6 passed (7)
Tests 1 failed | 25 passed (26)
AssertionError: expected false to be true
```

### Round 2 GREEN

Final focused command:

```text
pnpm exec vitest run src/lib/deploy.test.ts
Test Files 1 passed (1)
Tests 15 passed (15)
Exit code: 0
```

The focused regression proves that:

- the first published commit contains the originally validated `index.html` and `assets/site.css`, despite the source file rewrite and intermediate-directory replacement after validation;
- a second publish captures the new valid source state, and its commit contains the new `index.html`;
- both publishes remain normal `push origin HEAD:refs/heads/gh-pages` operations to the temporary local bare repository;
- both commit trees contain only the five expected generated files;
- the public inventory has exactly `path`, `bytes`, and `sha256` keys; and
- `src/lib/deploy.ts` contains neither `/proc/` nor `self/fd`.

Formatting and diff checks:

```text
pnpm exec prettier --check src/lib/deploy.ts src/lib/deploy.test.ts scripts/deploy.mjs
All matched files use Prettier code style!

git diff --check
Exit code: 0
```

### Round 2 Full Verification

Final command used the same isolated browser-library harness required by this host:

```text
LD_LIBRARY_PATH=/tmp/loom-playwright-libs-kCjOJpAJ/nspr/usr/lib/x86_64-linux-gnu:/tmp/loom-playwright-libs-kCjOJpAJ/nss/usr/lib/x86_64-linux-gnu pnpm --dir website verify
```

Result:

```text
Astro check: 0 errors, 0 warnings, 0 hints
Vitest: 7 files passed, 25 tests passed
Static build: 13 pages built; generated build verified
Playwright: 33 passed, 9 viewport-intentional skipped
Exit code: 0
```

The host-level preliminary runs failed only because local preview-server binding required sandbox approval and Chromium lacked `libnspr4.so`. `libnspr4` and `libnss3` package archives were downloaded and extracted beneath the exact temporary directory above without installing packages or changing the host package database. That exact directory was removed after the successful gate.

### Round 2 Default Dry Run

Final command:

```text
pnpm --dir website run deploy
```

Result: exit code 0 after the mandatory build, static-output validation, and inventory. It printed 20 deterministically sorted generated files totaling `157023` bytes and ended with:

```text
Dry run complete; no Git push was invoked. Use deploy:publish only with explicit authorization.
```

`deploy:publish` was not run. No command targeted or contacted the configured Git origin. The only publish operations were the two test-controlled pushes redirected to a temporary local bare repository.

### Round 2 Safety Review

- Source validation checks every path component with `lstat`/`realpath`, rejects symlinks and unsupported entries, opens regular files with `O_NOFOLLOW` where the platform supplies it, and compares file and intermediate-directory identities before and after reading.
- The validated payload is a private in-memory snapshot. Copying rechecks each buffer's size and SHA-256 digest and writes that buffer exclusively; source-tree mutations after validation cannot change published bytes.
- Required `CNAME`, `index.html`, and sitemap checks remain in force. Exact `loom-dev.xyz\n` validation is performed against the captured `CNAME` bytes.
- The portable implementation has no Linux `/proc` or `openat` dependency and does not expose snapshot buffers through `DeploymentInventory`.
- Existing exact-target, exact-branch, parent-origin, temporary-path, staged-inventory, normal-refspec, fast-forward-history, both-tree, worktree-preservation, and `finally` cleanup guards remain covered.
- No dependency or lockfile changed. No external Git fetch, push, remote edit/removal, reset, rebase, amend, or history rewrite was performed by this agent.

Parent and nested status were clean after the final local commit. The nested origin was preserved exactly as found:

```text
https://github.com/Loom-development/website.git
```

Commit sequence from the original Task 8 checkpoint through final HEAD:

```text
055cc53 feat: add guarded GitHub Pages deployment
f8c08e7 publish
a034e82 update
505d1b4 update
bbd15a3 update
50190b8 update
84306c4 test: reject all force deployment refspecs
96fcb91 update
a8e0815 update
ebff052 test: verify portable deployment snapshots
```

Files in this round:

- `website/src/lib/deploy.ts` — portable private validated-byte snapshot and snapshot-only copy path (recorded in user-owned commit `a8e0815`).
- `website/src/lib/deploy.test.ts` — mutation/directory-replacement, public-inventory-shape, no-`/proc`, and per-publish snapshot assertions (`a8e0815` plus final local checkpoint `ebff052`).

Concern unchanged: GitHub Pages and custom-domain/DNS setup are not configured. No Pages, DNS, or real deployment action was attempted.
