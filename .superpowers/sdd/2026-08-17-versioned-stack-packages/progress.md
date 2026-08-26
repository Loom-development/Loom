# SDD ledger — plan: docs/superpowers/plans/2026-08-17-versioned-stack-packages.md

## Pre-flight scan

| Tasks | Shared interface/files | Finding |
|---|---|---|
| 1 → 2 | `@loom/stacks`, `stacks/index.ts`, `stacks/pins.ts`, definition schema | Clean: Task 1 establishes the required strong contract; Task 2 adds definitions and pins. |
| 2 → 3 | registry, pins, migrated assets | Clean: copy-based definitions precede bootstrap definitions. |
| 1/2/3 → 4 | `assetPath`, CLI resolver, package assets | Clean: canonical assets exist before fallback removal and packaging switch. |
| 4 → 5 | packaged `stacks/`, scripts/installers, legacy references | Clean: Task 5 removes legacy assets only after isolated package tests pass. |
| 1 | Node vertical slice tests versus moved files | Clean after implementation; Node root assets moved without nested families. |
| 2 | 26 stacks in one review unit | Conflict: too broad for a reliable review gate. Ruling: execute sequential family subsets (JavaScript/web, language/application, databases), each with its own commit and review — preserves spec while adding review overhead — cost if wrong: intermediate registry compatibility definitions remain longer. |
| 3 | definition-driven bootstrap and exact pins | Clean. |
| 4 | source/package/release/install resolution switch | Clean; all consumers change atomically. |
| 5 | legacy deletion, docs, full smoke | Clean. |

Ruling: Existing main-branch execution continues because the user explicitly chose subagent-driven execution in this workspace — commits remain locally reversible — cost if wrong: work would need transplanting to a branch/worktree.

Task 1: complete (commit cc4d8c3, controller review clean)
Task 2 JavaScript subset: implementation commit d606989; fix commit 311dad9
Task 2 JavaScript subset: fix round 1/5 (3 addressed, 2 open — YAML normalization too broad; Bun/Serverless host-write metadata unsupported)
Task 2 JavaScript subset: fix round 2/5 (2 addressed, 0 open — commit b6e99df)
Task 2 JavaScript subset: complete (commits d606989..b6e99df, scoped re-review clean)
Task 2 language subset: Ruling: exact image values in `.env.example` are part of the pin boundary and may change during migration — otherwise they override exact `loom.yaml` fallbacks and defeat reproducibility — cost if wrong: more developer-visible template bytes change than a loom.yaml-only migration.
Task 2 language subset: minor (deferred): lifecycle metadata lacks per-stack regression expectations; final review must decide whether Task 5 smoke coverage is sufficient.
Task 2 language subset: review clarification: “no bootstrap or DB migration” restricts which stack packages move in this slice, not preserved runtime commands inside those templates.
Task 2 language subset: fix round 1/5 (1 addressed, 0 open — commit 69a1e05)
Task 2 language subset: complete (commits 8cf4b90..69a1e05, 1 deferred minor)
Task 2 database subset: Ruling: evolve `verification` from one argv array to ordered structured checks `{ service?: string; command: string[] }[]` — database clients live in containers and db-all must verify every service — cost if wrong: all migrated definitions and the future harness interface require a mechanical update now.
Task 2 database subset: fix round 1/5 (3 addressed, 0 open — commit f313e2d)
Task 2 database subset: complete (commits 594a3b4..f313e2d, scoped re-review clean)
Task 3: minor (deferred): semantic floating-version test does not inspect secondary Symfony Composer package.
Task 3: minor (deferred): shared bootstrap runner infers behavior from IDs/package strings; final review should assess typed generator-kind metadata.
Task 3: minor (deferred to Task 5): moved README/smoke script retain legacy `examples/` references.
Task 3: fix round 1/5 (1 addressed, 0 open — commit 8a2c223)
Task 3: complete (commits 3218ba4..8a2c223, 3 deferred minors)
Task 4: complete (commit d72f1fb, review clean; PowerShell parser/E2E unavailable on host)
Task 5: Ruling: optional `loom init --db` and upgrade database injection defaults must use canonical exact database pins, not floating duplicated literals — generated projects are inside the reproducibility boundary — cost if wrong: Task 5 expands into CLI rendering code and changes optional-DB Loom-owned output.
Task 5: minor (deferred): no-legacy-reference guard does not distinguish legitimate prose describing removed layout.
Task 5: fix round 1/5 (3 addressed, 0 open — commit 880f572)
Task 5: complete (commits b8c8956..880f572, 1 deferred minor; scoped re-review clean)
Final review: Ruling: extend manifest v2 additively with optional integer `definitionVersion`; new writes require it, old v2 manifests load via `legacyScaffoldVersions`, and upgrade rewrites current metadata — avoids a disruptive manifest v3 — cost if wrong: v2 now has two valid shapes and downstream consumers must branch carefully.
Final review: Ruling: defer fully typed bootstrap topology only if the final fix cannot land it safely; current five generators are exact and covered, but another generator family must not extend string/ID inference — cost if wrong: technical debt remains in bootstrap dispatch.
Final fix: all 5 blockers and 4 bounded minors addressed in one wave; typed bootstrap topology landed, actual npm tarball install/execute coverage passed, and `pnpm verify` plus `git diff --check` are green. Detailed evidence: `.superpowers/sdd/2026-08-17-versioned-stack-packages/final-fix-report.md`.
