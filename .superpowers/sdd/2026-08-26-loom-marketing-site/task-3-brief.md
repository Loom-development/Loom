### Task 3: Write the marketing pages

**Files:**
- Modify: `website/src/pages/index.astro`
- Create: `website/src/pages/features.astro`
- Create: `website/src/pages/teams.astro`
- Create: `website/src/components/BenefitGrid.astro`
- Create: `website/src/components/WorkflowSteps.astro`
- Create: `website/src/components/InstallCta.astro`
- Create: `website/src/data/marketing-pages.ts`
- Test: `website/src/lib/marketing-copy.test.ts`

**Interfaces:**
- Consumes: `MarketingLayout`, `CommandBlock`, and approved navigation.
- Produces: indexable `/`, `/features/`, and `/teams/` pages with unique metadata.
- Produces: `marketingPages`, the shared metadata and searchable copy assertions use as their independent content inventory.

- [ ] **Step 1: Write failing claim and metadata tests**

Create tests that assert:

```ts
expect(marketingPages.map((page) => page.pathname)).toEqual(["/", "/features/", "/teams/"]);
expect(new Set(marketingPages.map((page) => page.title)).size).toBe(3);
for (const page of marketingPages) {
  expect(page.description.length).toBeGreaterThanOrEqual(120);
  expect(page.description.length).toBeLessThanOrEqual(170);
  expect(page.copy).not.toMatch(/trusted by|\d+[,+] users|best-in-class|one command does everything/i);
}
```

Run: `pnpm --dir website test -- src/lib/marketing-copy.test.ts`

Expected: FAIL because `marketingPages` is missing.

- [ ] **Step 2: Implement exact homepage argument**

Use the approved sequence and messages:

1. Eyebrow: `LOCAL DEVELOPMENT, UNTANGLED`
2. H1: `Your whole dev stack. Ready when you are.`
3. Explanation: beginners start without learning container setup; source stays local; Podman runs tools and services.
4. Primary action: `Install Loom`; secondary: `Read the quick start`.
5. Proof strip: `31 versioned stacks`, `Linux · macOS · Windows`, `Powered by Podman`.
6. Benefits: `Files stay yours`, `One setup for the team`, `Services that are ready`.
7. Workflow: `Choose`, `Start`, `Build`.
8. Stack preview linked to `/stacks/`.
9. Team onboarding section linked to `/teams/`.
10. Final Install Loom action.

- [ ] **Step 3: Implement Features and Teams pages**

Features must explain local source, optional databases, readiness, HTTPS,
host-aligned writes, safe upgrade, doctor, clean, and backup in benefit language.
Teams must explain repository-based configuration and repeatable onboarding
without claiming centralized administration, cloud synchronization, or enterprise
policy features Loom does not have.

- [ ] **Step 4: Run tests and build**

Run: `pnpm --dir website check && pnpm --dir website build`

Expected: PASS; three pages have unique title, description, canonical, H1, and internal CTAs.

- [ ] **Step 5: Commit local source checkpoint**

```bash
git -C website add .
git -C website commit -m "feat: add beginner and team marketing pages"
```

---

