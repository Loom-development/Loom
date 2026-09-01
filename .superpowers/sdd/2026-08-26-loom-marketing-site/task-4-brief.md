### Task 4: Generate the canonical Stacks page

**Files:**
- Create: `website/src/lib/stacks.ts`
- Create: `website/src/components/StackCard.astro`
- Create: `website/src/components/StackFilter.astro`
- Create: `website/src/pages/stacks.astro`
- Test: `website/src/lib/stacks.test.ts`

**Interfaces:**
- Consumes: `stackDefinitions` from `@loom/stacks`.
- Produces: `publicStacks(): PublicStack[]`, where `PublicStack` contains `id`, `category`, `runtimeImages`, and a plain-language label.

- [ ] **Step 1: Write failing canonical-registry tests**

```ts
import { describe, expect, it } from "vitest";
import { publicStacks } from "./stacks";

describe("public stacks", () => {
  it("uses every canonical definition exactly once", () => {
    const stacks = publicStacks();
    expect(stacks).toHaveLength(31);
    expect(new Set(stacks.map(({ id }) => id)).size).toBe(31);
    expect(stacks.map(({ id }) => id)).toEqual([...stacks.map(({ id }) => id)].sort());
  });
});
```

Run: `pnpm --dir website test -- src/lib/stacks.test.ts`

Expected: FAIL because the adapter is missing.

- [ ] **Step 2: Implement the registry adapter and categories**

Derive IDs and runtime images only from `stackDefinitions`. Category selection
may use exact typed predicates (`id.startsWith("db-")`, known starter IDs, and
remaining application IDs), but must not duplicate the complete ID list.

Expose readable labels by transforming ID segments, with explicit casing only
for `.NET`, `T3`, `MERN`, `MEAN`, `PHP`, and database product names.

- [ ] **Step 3: Render progressive stack filtering**

Render all 31 cards in HTML with `data-category` and searchable text. The filter
script may hide nonmatching cards only after enhancement. Include a result count,
clear action, no-results message, and an accessible status region.

- [ ] **Step 4: Run tests and JavaScript-free output check**

Run:

```bash
pnpm --dir website check
pnpm --dir website build
grep -c 'data-stack-card' website/dist/stacks/index.html
```

Expected: PASS and count `31` before JavaScript executes.

- [ ] **Step 5: Commit local source checkpoint**

```bash
git -C website add .
git -C website commit -m "feat: generate searchable canonical stack catalog"
```

---

