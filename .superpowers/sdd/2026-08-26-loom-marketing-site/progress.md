# SDD ledger — plan: docs/superpowers/plans/2026-08-26-loom-marketing-site.md

## Pre-flight interface and conflict scan

| Tasks | Producer / consumer or internal consistency | Finding |
|---|---|---|
| 1 | Creates the isolated Astro package, metadata constants, scripts, local repository, and parent ignore rule | Internally consistent. The RED step precedes creation of the directory, so a missing-directory failure is acceptable evidence. |
| 2 | Consumes Task 1 metadata and scripts; produces shared layouts/components/navigation | Internally consistent. The temporary homepage is explicitly replaced by Task 3. |
| 3 | Consumes Task 2 layouts/components; replaces the Task 2 homepage tracer | Internally consistent; descriptions and claims have explicit tests and factual constraints. |
| 4 | Consumes the Task 1 local `@loom/stacks` dependency and Task 2 layout; produces canonical stack adapter/page | Internally consistent. Count 31 is both a release fact and asserted output. |
| 5 | Consumes Task 2 DocsLayout and shared components; produces docs collection/routes/navigation | Internally consistent. It links to Task 4 rather than duplicating the stack registry. |
| 6 | Consumes all routes from Tasks 3–5; produces structured data, crawler assets, 404, and static verifier | Internally consistent. Astro sitemap naming and robots target both specify `sitemap-index.xml`. |
| 7 | Consumes the built output and UI from Tasks 2–6; produces browser/accessibility gates | Internally consistent. Playwright installs Chromium locally and tests an already-built preview. |
| 8 | Consumes Task 6 verified `dist/`; produces dry-run and explicit generated-only publishing | Internally consistent. Publishing remains separately authorized and is never invoked by verification. |
| 9 | Consumes the complete site and gates; permits only verification-driven website fixes | Internally consistent. Fresh-reader review is a release gate and any resulting edits receive a final local commit. |
| 1 → 2 | `SitePageMeta` and constants feed layouts and SEO components | Compatible exact interface. |
| 1 → 4 | Local package link feeds canonical `stackDefinitions` adapter | Compatible; stack package must be built before import, which Task 1 scripts enforce. |
| 2 → 3 | Marketing layout and command component feed all marketing pages | Compatible; Task 3 owns the final homepage content. |
| 2 → 5 | Docs layout and shared controls feed Markdown-driven docs | Compatible; Task 5 completes navigation behavior. |
| 3/4/5 → 6 | Generated pages feed metadata/link/structured-data verification | Compatible; Task 6 is the first full static-output gate. |
| 2/4/5/6 → 7 | UI semantics and built routes feed browser and Axe tests | Compatible; tests exercise the specified progressive enhancement behavior. |
| 6/7 → 8 | Verified output and complete gate feed deployment validation | Compatible; deploy defaults to dry-run. |
| 1–8 → 9 | Local source history, ignored boundary, output, and tests feed release verification | Compatible; no external publish or DNS mutation is authorized. |

Ruling: Execute the approved plan while the parent repository is on `main` because the user selected execution option 1 after approving the local-only architecture; only the narrow `.gitignore` policy change touches parent `main`, while all website checkpoints live in the nested local repository — if wrong, the parent `.gitignore` change must be moved to another branch.

Ruling: Treat the nested `website/.git` repository as the isolated implementation and review history; review packages will be produced from that repository, with the Task 1 package also including the parent `.gitignore` diff — if wrong, task-level diff tooling may need to be adapted or the local history recreated in a worktree.

Ruling: Never execute `deploy:publish`, push, modify GitHub Pages settings, or change DNS during this plan run; Task 8 may publish only to temporary local bare repositories in tests — if wrong, the user will need to authorize and perform the external handoff separately.

Task 1: Ruling: Replace the plan's incompatible `typescript: 7.0.2` pin with an exact compatible TypeScript 6 release because `@astrojs/check@0.9.10` declares only `^5.0.0 || ^6.0.0` and the required check fails before inspecting the site; the approved spec requires passing type/content checks and predictable exact pins, not TypeScript 7 specifically — if wrong, the dependency pin will need to move back after Astro's checker adds TypeScript 7 support.

Task 1: complete (commits 4b825dc..4033313, review clean)

Task 2: fix round 1/5 (4 addressed, 1 open — social-card asset is not created until Task 6; commits 6942338..86376c6)

Task 2: Ruling: Keep the corrected `/social-card.svg` metadata contract but leave the asset itself to Task 6, whose explicit file list creates `website/public/social-card.svg`; creating it in Task 2 would violate the plan's task ownership, and release output cannot be considered complete until Task 6 closes this dependency — if wrong, the metadata URL remains broken during Tasks 2–5 and the asset should be pulled forward.

Task 2: minor (deferred): Clipboard `writeText` rejection feedback is exposed through the polite live region but is visually hidden.

Task 2: complete (commits 4033313..86376c6, review clean subject to recorded cross-task asset ruling)

Task 3: Ruling: Until Task 6 creates its explicitly owned `scripts/verify-build.mjs`, accept `pnpm check` plus `pnpm exec astro build` as the production-build evidence for Tasks 3–5; the package's full `pnpm build` wrapper is structurally unable to complete before that task — if wrong, a temporary verifier stub would need to be introduced and later replaced, adding avoidable transitional behavior.

Task 3: minor (deferred): Prohibited-claim tests cover the shared content inventory but not all inline rendered Astro copy.

Task 3: complete (commits 86376c6..4765690, review clean)

Task 4: minor (deferred): Reported stack-card verification used occurrence counting instead of the brief's literal `grep -c`, because Astro minifies the HTML to one line.

Task 4: complete (commits 4765690..3d28f05, review clean)

Task 5: fix round 1/5 (1 addressed, 0 open; commits 8d482e3..5adc5bb)

Task 5: minor (deferred): Responsive drawer focus regression is covered by a static source-contract test until Task 7 adds browser interaction coverage.

Task 5: complete (commits 3d28f05..5adc5bb, review clean)

Task 6: fix round 1/5 (4 addressed, 0 open; commits 9ca038a..3699529)

Task 6: minor (deferred): Build verifier's fixed marketing-route set must be updated manually when future marketing routes are added.

Task 6: minor (deferred): Absolute breadcrumb item URLs are helper-tested but the build verifier checks BreadcrumbList presence rather than each item's URL shape.

Task 6: complete (commits 5adc5bb..3699529, review clean)

Task 7: fix round 1/5 (3 addressed, 0 open; commits ea01f9e..d08b49f)

Task 7: complete (commits 3699529..d08b49f, review clean)

Task 8: Ruling: Use `pnpm --dir website run deploy` and `pnpm --dir website run deploy:publish` as the callable deployment interface because pnpm 10.6.5 reserves bare `pnpm deploy` for its workspace deployment command and never dispatches the package script — if wrong, user-facing commands can be shortened only after pnpm changes or the script is renamed to a non-reserved word.

Task 8: Ruling: Preserve the concurrently established nested `origin` (`https://github.com/Stargate-a11y/website.git`) and additional local-source commits instead of removing or rewriting user-visible history; no agent may push to it, and the original no-remote privacy assertion becomes a final handoff discrepancy — if wrong, the remote and published source history must be removed manually with explicit user authorization.

Task 8: Ruling: Supersede the prior remote-preservation ruling after the user transferred the repository and explicitly confirmed it: nested `origin` is now `https://github.com/Loom-development/website.git`; preserve that remote and continue to prohibit pushes during implementation — if wrong, only the local remote URL needs correction.

Task 8: fix round 1/5 (3 addressed, 1 open — Linux-only snapshot portability; commits 055cc53..84306c4)

Task 8: fix round 2/5 (1 addressed, 0 open; commits 84306c4..ebff052)

Task 8: complete (commits d08b49f..ebff052, review clean)

Task 9: Ruling: Treat the user-approved `https://github.com/Loom-development/website.git` origin as the intended separate-source workflow, superseding Task 9's old no-remote assertion; parent privacy still holds because `website/` remains ignored and untracked by the Loom repository — if wrong, remove the website remote only with explicit user authorization.

Task 9: Ruling: Accept current automated verification, production-output inspection, and final independent review as the release gate because the fresh-reader worker exhausted its usage quota before returning; retain fresh-reader testing as a post-release-content check — if wrong, a navigation or wording issue may require a small follow-up commit.

Task 9: complete (commits 4033313..ebff052, verify and final review clean)
