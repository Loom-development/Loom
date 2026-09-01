# Task 5 Report: Build task-focused documentation

## Status

Complete. The nested `website` repository is clean at follow-up commit
`5adc5bb305972949d81392140fdd4d12a134beb1` (`fix: restore docs focus across breakpoint`),
on top of the original Task 5 checkpoint `8d482e3fa92f09267e62375bace57f8083c16ab1`.

The implementation adds an Astro 7 content collection, seven beginner guides,
an overview plus seven generated documentation routes, ordered navigation,
desktop sticky navigation, an accessible progressively enhanced mobile drawer,
and previous/next guide links. It does not add an Edit on GitHub link and does
not touch Task 6's `/social-card.svg` work.

## Source verification

Documentation claims and examples were checked against repository sources before
writing. No commands or behaviors were inferred from external documentation.

- `website/package.json` and root `README.md`: Node 24+, Podman, conditional
  OpenSSL requirement, npm package name, high-level installation/quick-start
  sequence, and local-only product scope.
- `scripts/install.sh` and `scripts/install.ps1`: exact GitHub release installer
  commands, supported archive selection, Node/Podman checks, Unix install path,
  Windows user `PATH` update, and new-terminal caveat.
- `apps/cli/src/index.ts`: all 15 registered commands and their actual command
  signatures/options: `init`, `adopt`, `upgrade`, `doctor`, `clean`, `start`,
  `stop`, `restart`, `status`, `ps`, `test`, `logs`, `exec`, `backup`, and
  `restore`.
- `apps/cli/src/init-prompt.ts`: optional database prompt and exact optional IDs
  (`postgres`, `mysql`, `mariadb`, `mongodb`, `redis`).
- `apps/cli/src/init.integration.test.ts`: adoption preserves application and
  package/lock/environment example files and refuses to overwrite an existing
  `loom.yaml`.
- `packages/core/src/startup.ts`, `packages/core/src/routes.ts`, and
  `packages/core/src/status.ts`: readiness behavior, printed browser route,
  `:8443` HTTPS proxy port, hosts messages, certificate paths, and status fields.
- `packages/network/src/index.ts`: managed, pending, and skipped wildcard hosts.
- `packages/core/src/backup.ts`, `packages/core/src/restore.ts`, and
  `packages/runtime-podman/src/backup.ts`: service-name-based backup/restore,
  supported database types, default backup location, running-service requirement,
  and the explicit SQL Server restore limitation.
- `website/src/lib/stacks.ts`, `stacks/index.ts`, and
  `website/src/pages/stacks.astro`: the canonical 31-stack registry and its
  `/stacks/` presentation. The docs link there instead of copying the IDs.

## RED / GREEN

### RED

Added `src/lib/docs-navigation.test.ts` first at the agreed public data seam and
ran:

```text
pnpm --dir website test -- src/lib/docs-navigation.test.ts
```

It failed as expected with:

```text
Cannot find module '../data/docs-navigation'
```

### GREEN

Added `src/data/docs-navigation.ts` with the seven exact slugs in display order,
unique positive integer orders, beginner-facing titles/descriptions, and stable
route hrefs. Re-running the focused command passed; at that point Vitest reported
five test files and six tests passing.

The dynamic route also enforces the collection-to-navigation contract during a
build: there must be exactly one content entry for each navigation item, orders
must be unique, and each entry's slug/title/order must match its navigation item.

## Implementation

### Content collection and routes

- Added Astro 7 `src/content.config.ts` using `glob()` and a Zod schema.
- The schema rejects blank titles/descriptions and non-integer or non-positive
  order values.
- Added `/docs/` as the task overview.
- Added `[...slug].astro` using `getCollection("docs")`, `getStaticPaths()`, and
  `render()`.
- All guide content is in Markdown and arrives in the initial static HTML; the
  documentation does not require JavaScript to be read.
- Every route renders one H1. Markdown guide bodies begin below the route-owned H1
  and use logical H2/H3 sections.

### Documentation content

- Installation: Node 24+, Podman, conditional OpenSSL, npm, both GitHub release
  installers, `PATH` caveats, and `loom --version`.
- Quick Start: `init`, optional database choice, `start`, the printed `:8443`
  route, hosts/certificate caveats, `status`, and `stop`.
- Choose a Stack: starter/application/database categories and a canonical
  `/stacks/` link without a copied ID list.
- Commands: every command registered in the CLI and version-matched option
  discovery through `loom <command> --help`.
- Existing Projects: `loom adopt [stack]`, preserved developer files,
  `.env.example` behavior, refusal to overwrite `loom.yaml`, and
  `loom start --recreate` after configuration changes.
- Databases: optional database IDs, `loom status` service-name discovery, backup
  coverage, restore coverage, and SQL Server's restore limitation.
- Troubleshooting: begins with `podman info`, `loom doctor`, `loom status`, and
  `loom logs app`; then covers Podman, readiness/logs, recreate, hosts entries,
  wildcard hosts, and local-certificate warnings.

The doc-coauthoring quality pass kept each page centered on a reader task, put
commands adjacent to the action they perform, used plain beginner language, and
removed redundant catalog maintenance.

### Navigation and accessibility

- Added one shared `DocsNavigation` renderer for desktop, no-JavaScript mobile,
  and drawer navigation.
- Desktop navigation is sticky and marks the active page with
  `aria-current="page"`.
- Without JavaScript, mobile users receive the complete inline navigation.
- With JavaScript, that navigation progressively enhances into a button-controlled
  modal drawer with an accessible name, close button, backdrop close, focus moved
  into the dialog, Tab/Shift+Tab wrapping, Escape close, and trigger focus restore.
- Previous/next links are derived directly from `docsNavigation`; the first and
  last guides expose only the applicable neighbor.
- Layout stays inside the existing `70rem` container and `38.75rem` prose tokens.
- The overview consumes the shared `CommandBlock`; Markdown code and note styles
  remain readable without enhancement.

## Exact checks

### Focused TDD check

```text
pnpm --dir website test -- src/lib/docs-navigation.test.ts
```

PASS after the initial expected RED: 5 files, 6 tests.

### Required repository check

```text
pnpm --dir website check
```

PASS:

- stack package TypeScript build passed;
- Astro checked 32 files with 0 errors, 0 warnings, and 0 hints;
- Vitest passed 5 files and 6 tests.

### Accepted direct build for Task 5

```text
pnpm --dir website exec astro build
```

PASS: 12 total pages built, including exactly these eight docs routes:

```text
/docs/
/docs/commands/
/docs/databases/
/docs/existing-projects/
/docs/installation/
/docs/quick-start/
/docs/stacks/
/docs/troubleshooting/
```

Task 5 intentionally used direct `astro build`; Task 6 owns the not-yet-present
build verifier.

### Rendered HTML contract check

A temporary Cheerio harness inspected `dist/docs` and passed checks for:

- the exact eight-route set;
- one H1 and substantial server-rendered article content per route;
- eight links in both desktop and drawer navigation;
- the correct `aria-current` page on every route;
- first/last previous-next boundaries;
- the `/stacks/` canonical catalog link; and
- absence of Edit on GitHub text.

The temporary harness was removed after the check and was not committed.

### Repository hygiene

```text
git -C website diff --check
git -C website status --short
```

PASS. The committed nested worktree is clean.

## Files

Created:

- `website/src/content.config.ts`
- `website/src/components/DocsNavigation.astro`
- `website/src/data/docs-navigation.ts`
- `website/src/lib/docs-navigation.test.ts`
- `website/src/pages/docs/index.astro`
- `website/src/pages/docs/[...slug].astro`
- `website/src/content/docs/installation.md`
- `website/src/content/docs/quick-start.md`
- `website/src/content/docs/stacks.md`
- `website/src/content/docs/commands.md`
- `website/src/content/docs/existing-projects.md`
- `website/src/content/docs/databases.md`
- `website/src/content/docs/troubleshooting.md`

Modified:

- `website/src/layouts/DocsLayout.astro`
- `website/src/styles/global.css`

## Self-review

- Confirmed the navigation's displayed order exactly matches the brief.
- Confirmed all frontmatter values are non-empty and orders are unique positive
  integers from 1 through 7.
- Confirmed all 15 commands registered by the CLI appear in the Commands guide.
- Confirmed no Markdown file adds another H1.
- Confirmed the stack guide does not copy the 31 canonical IDs.
- Confirmed no Edit on GitHub link or Task 6 social-card work was introduced.
- Confirmed scripts enhance already-present content/navigation rather than owning
  the readable content.
- Replaced the drawer label's heading element with a labelled paragraph so hidden
  dialog markup cannot disrupt the page's H1/H2 document outline.
- Confirmed no unrelated user changes were present or modified.

## Concerns and limitations

The local Astro preview could bind only with sandbox escalation. Once running,
the installed Chromium binary could not launch because the environment lacks the
system library `libnspr4.so`. Therefore a live browser interaction run was not
possible in this task. The focus-trap/Escape/focus-restore code was manually
reviewed at each event path, while the built markup/state contracts were verified
with Cheerio. Task 6's browser/e2e gate should exercise the drawer once the browser
runtime dependencies are available.

## Review follow-up: breakpoint focus restoration

Committed in the nested `website` repository as
`5adc5bb305972949d81392140fdd4d12a134beb1`
(`fix: restore docs focus across breakpoint`). The nested worktree is clean.

### Finding and patch

The accessibility review found that resizing an open mobile drawer across the
`48rem` desktop breakpoint called `closeDrawer(false)`. That hid both the drawer
and the mobile navigation region while leaving keyboard focus in hidden content.

The patch keeps dismissal behavior distinct by focus destination:

- Escape, the close button, and backdrop dismissal still restore the element that
  opened the drawer (normally the mobile trigger).
- A breakpoint-driven close now focuses the current visible link in the desktop
  documentation sidebar.
- `#main-content` is the fallback and now has `tabindex="-1"`, making that fallback
  programmatically focusable without adding it to normal Tab order.
- If the drawer is already closed but focus is elsewhere in the mobile navigation
  as the desktop breakpoint is crossed, focus is also moved to the same visible
  desktop destination.

### Focused RED / GREEN evidence

The focused static contract test was added first to
`website/src/lib/docs-navigation.test.ts` and verifies the desktop current-link
target, focusable main fallback, breakpoint close call, and removal of
`closeDrawer(false)`.

Command:

```text
pnpm --dir website test -- src/lib/docs-navigation.test.ts
```

RED before implementation:

```text
Test Files  1 failed | 4 passed (5)
Tests       1 failed | 6 passed (7)
AssertionError: expected DocsLayout.astro to contain
"const desktopFocusTarget = () =>"
```

GREEN after implementation and the strengthened fallback assertions:

```text
Test Files  5 passed (5)
Tests       7 passed (7)
Duration    309ms
```

### Final check evidence

Command:

```text
pnpm --dir website check
```

Result:

```text
Astro check: 32 files, 0 errors, 0 warnings, 0 hints
Test Files:  5 passed (5)
Tests:       7 passed (7)
Duration:    307ms
```

Command:

```text
pnpm --dir website exec astro build
```

Result:

```text
12 page(s) built in 1.61s
All eight documentation routes generated successfully
Build complete
```

### Follow-up self-review

- Traced every `closeDrawer` caller: ordinary dismissals use the original default
  focus target; only the desktop media-query path supplies the desktop target.
- Confirmed the current sidebar link exists on the overview and all seven guides
  through their existing `aria-current="page"` contract.
- Confirmed the main fallback is visible at desktop widths and focusable only by
  script, not in the sequential keyboard order.
- Confirmed the breakpoint listener does not move focus when focus is already
  outside the hidden mobile navigation.
- Confirmed no CSS breakpoint, drawer visibility, Escape, Tab wrapping, or
  previous/next behavior was changed.
