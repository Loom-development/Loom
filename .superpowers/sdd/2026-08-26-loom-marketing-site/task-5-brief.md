### Task 5: Build task-focused documentation

**Files:**
- Create: `website/src/content.config.ts`
- Create: `website/src/data/docs-navigation.ts`
- Create: `website/src/pages/docs/index.astro`
- Create: `website/src/pages/docs/[...slug].astro`
- Create: `website/src/content/docs/installation.md`
- Create: `website/src/content/docs/quick-start.md`
- Create: `website/src/content/docs/stacks.md`
- Create: `website/src/content/docs/commands.md`
- Create: `website/src/content/docs/existing-projects.md`
- Create: `website/src/content/docs/databases.md`
- Create: `website/src/content/docs/troubleshooting.md`
- Test: `website/src/lib/docs-navigation.test.ts`

**Interfaces:**
- Produces: `docsNavigation` in the exact displayed order above.
- Produces: docs frontmatter schema `{ title, description, order }` with unique positive integer order.
- Consumes: `DocsLayout` and shared command/callout components.

- [ ] **Step 1: Write failing collection and navigation tests**

```ts
expect(docsNavigation.map(({ slug }) => slug)).toEqual([
  "installation", "quick-start", "stacks", "commands",
  "existing-projects", "databases", "troubleshooting"
]);
expect(new Set(docsNavigation.map(({ order }) => order)).size).toBe(7);
```

Run: `pnpm --dir website test -- src/lib/docs-navigation.test.ts`

Expected: FAIL because docs navigation is missing.

- [ ] **Step 2: Define the Astro content collection**

Use Astro 7's `src/content.config.ts`, `glob()` loader, and Zod schema. Reject
empty title/description and non-positive order. The `[...slug].astro` route uses
`getCollection("docs")`, `getStaticPaths()`, and `render()`.

- [ ] **Step 3: Write beginner documentation with verified commands**

Required outcomes:

- Installation covers Node 24+, Podman, conditional OpenSSL, npm, GitHub release installers, and `loom --version`.
- Quick Start covers `init`, optional DB prompt, `start`, printed `:8443` route, hosts/certificate caveats, `status`, and `stop`.
- Stacks explains the categories and links to `/stacks/` rather than maintaining another 31-ID list.
- Commands covers every registered CLI command and uses `loom <command> --help` for option discovery.
- Existing Projects covers `loom adopt [stack]`, preserved files, refusal to overwrite `loom.yaml`, and `start --recreate` after config changes.
- Databases covers optional DB IDs, service-name discovery with `status`, backup support, and SQL Server restore limitation.
- Troubleshooting begins with `podman info`, `loom doctor`, `loom status`, and `loom logs app`; it explains hosts and local certificate warnings.

- [ ] **Step 4: Implement persistent docs navigation**

Desktop sidebar is sticky and marks the current page with `aria-current="page"`.
Mobile uses a button and dialog/drawer pattern, traps focus while open, closes on
Escape, and restores focus. Previous/next links derive from `docsNavigation`.

- [ ] **Step 5: Run docs checks and build**

Run: `pnpm --dir website check && pnpm --dir website build`

Expected: PASS with eight docs routes, unique metadata, sidebar links, and no Edit on GitHub link.

- [ ] **Step 6: Commit local source checkpoint**

```bash
git -C website add .
git -C website commit -m "feat: add beginner-focused Loom documentation"
```

---

