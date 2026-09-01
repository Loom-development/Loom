# Task 1 — Isolated Astro Foundation Report

## Status

Implementation and the compatibility correction are complete. The isolated
source checkpoint is committed in the nested repository, and the required
`pnpm --dir website check` now passes. The parent repository contains only the
intentionally unstaged `.gitignore` policy change.

## Implementation

- Added the exact parent ignore rule `website/` to `.gitignore`; it was not
  staged or committed in the parent repository.
- Created `website/` as a standalone Git repository on `local-source`, with
  no configured remotes.
- Added the required nested ignore rules, exact `package.json`, isolated pnpm
  lockfile, Astro configuration, TypeScript configuration, Astro environment
  declarations, site metadata module, and Vitest metadata test.
- The metadata module exports `SITE_ORIGIN`, `SITE_NAME`, `GITHUB_URL`,
  `NPM_PACKAGE`, `SitePageMeta`, and `pageUrl` with the values and behavior
  required by the task.

## Commands and Results

| Command | Result |
| --- | --- |
| `cd website && pnpm exec vitest run src/lib/site.test.ts` before creation | RED: exit 1, `/bin/bash: line 1: cd: website: No such file or directory` |
| `mkdir website`; `git -C website init`; `git -C website branch -M local-source`; `test -z "$(git -C website remote)"` | Passed; nested repository initialized on `local-source` with no remote. |
| `pnpm --dir website install` | Exit 0, but pnpm inherited the parent workspace and did not write a nested lockfile. |
| `pnpm --dir website install --ignore-workspace` | Exit 0; generated `website/pnpm-lock.yaml` with the exact resolutions and local `@loom/stacks` linkage. |
| `pnpm --dir website exec vitest run src/lib/site.test.ts` | GREEN: exit 0; 1 file passed, 1 test passed. |
| `pnpm --dir website check` | Exit 1; `build:stacks` passed, then `astro check` stopped on the exact TypeScript/Astro incompatibility described below. |
| `pnpm --dir website test` | Exit 0; 1 file passed, 1 test passed. |
| `git -C website diff --cached --check` | Exit 0; no whitespace errors. |

## RED/GREEN Evidence

The required RED command was run before the project existed and failed because
the `website` directory and `site.ts` module did not exist. After creating the
prescribed source and test, the same focused Vitest command passed with one
test. The complete Vitest suite also passed with one test.

## Files Changed

Parent, intentionally unstaged:

- `.gitignore`

Nested repository, committed:

- `website/.gitignore`
- `website/package.json`
- `website/pnpm-lock.yaml`
- `website/astro.config.mjs`
- `website/tsconfig.json`
- `website/src/env.d.ts`
- `website/src/lib/site.ts`
- `website/src/lib/site.test.ts`

## Self-Review

- Confirmed the parent change is exactly `website/` and remains unstaged.
- Confirmed the nested repository is on `local-source`, is clean after its
  commit, and has no remote.
- Confirmed the nested `.gitignore` excludes Astro output, dependencies, and
  test artifacts; generated `.astro/` files were not committed.
- Checked the staged nested diff for whitespace errors before committing.
- Confirmed all requested package scripts and exact dependency versions are
  present and that the metadata test checks the public module seam.

## Commit

- `6ad1424 chore: create local Astro site foundation` (nested `website/.git` only)
- `4033313 fix: use compatible TypeScript for Astro checks` (nested `website/.git` only)

## Concern

The initial manifest pinned `typescript` to `7.0.2`, while the required
`astro` 7.2.8 / `@astrojs/check` 0.9.10 check path currently requires
TypeScript's pre-7 programmatic compiler API. This was resolved in the
compatibility-fix addendum below by using the current supported TypeScript 6.x
release under the subsequent task ruling.

## Compatibility-Fix Addendum

### Change

- Queried the npm registry: `pnpm view typescript@6 version` returned
  `typescript@6.0.2 '6.0.2'` and `typescript@6.0.3 '6.0.3'`.
- Updated only `website/package.json` from `typescript: "7.0.2"` to the current
  exact compatible release `typescript: "6.0.3"`.
- Ran `pnpm --dir website install --ignore-workspace` successfully. It updated
  only the TypeScript resolution and its peer-dependent lockfile entries in
  `website/pnpm-lock.yaml`; no other declared dependency pin changed.

### Verification

| Command | Result |
| --- | --- |
| `pnpm --dir website exec vitest run src/lib/site.test.ts` | Exit 0; 1 file passed, 1 test passed. |
| `pnpm --dir website check` | Exit 0. `@loom/stacks` built, Astro reported 0 errors, 0 warnings, 0 hints across 5 files, and Vitest passed 1 file / 1 test. |
| `git -C website diff --check HEAD` | Exit 0; no whitespace errors. |
| `git -C website diff --name-only HEAD` | Only `package.json` and `pnpm-lock.yaml`. |
| `git -C website remote -v` | No output; no nested remote configured. |

### Compatibility-Fix Self-Review

- Confirmed `typescript@6.0.3` satisfies `@astrojs/check@0.9.10`'s TypeScript
  6 peer range and restores the compiler API used by `astro check`.
- Confirmed the focused public metadata seam and the full required check pass.
- Confirmed no other manifest dependency pin changed, and the parent
  `.gitignore` policy change remains unstaged.
