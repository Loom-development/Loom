### Task 2: Build the design system and shared layouts

**Files:**
- Create: `website/src/styles/tokens.css`
- Create: `website/src/styles/global.css`
- Create: `website/src/components/SiteHeader.astro`
- Create: `website/src/components/SiteFooter.astro`
- Create: `website/src/components/SeoHead.astro`
- Create: `website/src/components/CommandBlock.astro`
- Create: `website/src/layouts/MarketingLayout.astro`
- Create: `website/src/layouts/DocsLayout.astro`
- Create: `website/src/lib/navigation.ts`
- Create: `website/src/pages/index.astro`
- Test: `website/src/lib/navigation.test.ts`

**Interfaces:**
- Consumes: `SitePageMeta`, `SITE_ORIGIN`, `SITE_NAME`, and `GITHUB_URL` from Task 1.
- Produces: `MarketingLayout` and `DocsLayout`, each accepting `meta: SitePageMeta`.
- Produces: `CommandBlock` accepting `label: string`, `code: string`, and optional `language: string`.

- [ ] **Step 1: Write failing navigation and metadata tests**

```ts
import { describe, expect, it } from "vitest";
import { primaryNavigation } from "./navigation";

describe("primary navigation", () => {
  it("exposes the approved public destinations", () => {
    expect(primaryNavigation.map(({ label, href }) => [label, href])).toEqual([
      ["Features", "/features/"], ["Stacks", "/stacks/"], ["Teams", "/teams/"],
      ["Docs", "/docs/"], ["GitHub", "https://github.com/Loom-development/Loom"]
    ]);
  });
});
```

Run: `pnpm --dir website test -- src/lib/navigation.test.ts`

Expected: FAIL because `navigation.ts` is missing.

- [ ] **Step 2: Implement navigation, tokens, and layouts**

Define tokens with these required values:

```css
:root {
  --color-ink: #090d12;
  --color-surface: #0e141b;
  --color-paper: #edf2ee;
  --color-text: #edf5f0;
  --color-muted: #9bada3;
  --color-accent: #6bf0ae;
  --color-rule: #27313a;
  --content-max: 70rem;
  --prose-max: 38.75rem;
  --font-display: Georgia, "Times New Roman", serif;
  --font-body: Inter, ui-sans-serif, system-ui, sans-serif;
  --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}
```

`SeoHead.astro` must render title, description, canonical, robots, Open Graph,
social image, sitemap link, theme color, and JSON-LD passed by the page. It must
not render rating, offer, or review properties.

`SiteHeader.astro` uses a semantic `<nav aria-label="Main navigation">`, a real
button for the mobile menu, `aria-expanded`, Escape-to-close behavior, and a
visible Install Loom link to `/docs/installation/`.

`CommandBlock.astro` renders `<pre><code>` before its enhancement script so the
command remains visible when JavaScript is disabled. Its copy button announces
success with a polite live region and returns to its original label.

- [ ] **Step 3: Create a minimal homepage tracer page**

Render `MarketingLayout` with:

```ts
const meta = {
  title: "Loom — Local Development Environments with Podman",
  description: "Create consistent local development environments with Podman. Keep source files local while Loom runs apps, databases, health checks, and HTTPS.",
  pathname: "/"
} satisfies SitePageMeta;
```

Include one H1, one install command, and links to Quick Start and GitHub. Full
homepage content lands in Task 3.

- [ ] **Step 4: Run GREEN, Astro check, and production build**

Run:

```bash
pnpm --dir website check
pnpm --dir website exec astro build
```

Expected: PASS and `website/dist/index.html` contains the canonical URL and one H1.

- [ ] **Step 5: Commit local source checkpoint**

```bash
git -C website add .
git -C website commit -m "feat: add editorial site design system"
```

---

