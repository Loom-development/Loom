# Loom Marketing and Documentation Website Design

Date: 2026-08-26
Status: Approved design
Canonical URL: `https://loom-dev.xyz`

## Purpose

Create a fast static website that explains Loom to beginners and teams, helps
visitors install it, and provides task-focused documentation. The website will
be hosted with GitHub Pages, but its Astro source will remain local and ignored.
Only generated static output will be published to the `gh-pages` branch.

The homepage's primary action is installing Loom. Documentation and GitHub are
secondary actions.

## Audience

The primary audiences are:

1. Beginners who want a working local project without first learning container
   configuration.
2. Teams that want every developer to start from the same repeatable local
   environment.

The site should remain credible to experienced developers, but it must not
assume container knowledge or use implementation jargon where plain language
works.

## Product position

The core promise is:

> Your whole dev stack. Ready when you are.

Supporting messages:

- Project source stays local and works with a normal editor and Git.
- Loom runs language tools and services with Podman.
- Beginners can start without writing container configuration.
- Teams can share one consistent project setup.
- Loom waits for services to be ready and provides safe diagnostics, cleanup,
  upgrades, and database backups.

Claims must be supported by current repository behavior. The site will not use
invented testimonials, ratings, adoption numbers, benchmarks, prices, or
absolute one-command claims.

## Information architecture

Marketing pages:

- `/` — homepage for the broad product promise and install action
- `/features/` — local files, repeatable environments, services, HTTPS, safe
  updates, diagnostics, and backups
- `/stacks/` — filterable overview of all published stack definitions
- `/teams/` — onboarding and consistent shared setup

Documentation pages:

- `/docs/` — documentation landing page
- `/docs/installation/`
- `/docs/quick-start/`
- `/docs/stacks/`
- `/docs/commands/`
- `/docs/existing-projects/`
- `/docs/databases/`
- `/docs/troubleshooting/`

Site utilities:

- `/404.html`
- `/robots.txt`
- `/sitemap-index.xml` or Astro's generated equivalent
- `/CNAME`

Primary navigation: Features, Stacks, Teams, Docs, GitHub, and a highlighted
Install Loom action.

Documentation uses a persistent desktop sidebar, a compact accessible mobile
drawer, previous/next links, and command copy buttons. It does not display Edit
on GitHub links because the website source is local-only.

## Visual direction

The approved direction is Terminal Editorial:

- Near-black background with warm off-white text
- Restrained green accent for actions, status, and small labels
- Editorial serif for large headings
- Highly readable sans-serif for body copy
- Monospace for commands, labels, and technical details
- Crisp rules and restrained surfaces instead of generic rounded card grids

The main content container is approximately 1120px wide. Reading text is capped
near 620px. Background bands may span the viewport, but their content stays in
the centered container. The full approved homepage content remains present even
though the width comparison mockup used abbreviated sections.

Homepage hierarchy:

1. Navigation and Install Loom action
2. Hero with value proposition, install command, and Quick Start link
3. Proof strip: 31 stacks, three supported desktop platforms, Podman runtime
4. Three benefits: local files, consistent team setup, readiness checks
5. Three-step workflow: choose, start, build
6. Stack overview
7. Team onboarding message
8. Final install action

## Responsive behavior and accessibility

- Desktop pages use the centered editorial container.
- Mobile navigation is keyboard and screen-reader operable.
- Documentation sidebar becomes a Browse docs drawer on narrow screens.
- Stack filtering enhances the page with JavaScript; all stacks remain present
  and readable without JavaScript.
- Code blocks include visible language labels and accessible copy buttons.
- Every interactive control has an accessible name and visible focus state.
- Color combinations meet WCAG AA contrast.
- Heading order is logical and each page has one H1.
- Motion is brief, optional, and disabled by reduced-motion preferences.
- Fonts are local assets or system-safe; no third-party tracking request is
  required to render the page.
- The first release includes no analytics, cookie banner, newsletter popup,
  autoplay media, or decorative animation.

## SEO strategy

Canonical origin: `https://loom-dev.xyz`.

Search intent by page:

- Home: local development environment, Podman development
- Features: Docker Desktop alternative for local development
- Teams: developer onboarding environment, consistent local setup
- Stacks: framework-specific local development searches
- Docs: task queries such as installing Loom, starting a Podman development
  stack, and adding PostgreSQL to a local project

Every indexable page must have:

- A unique 50–60 character target title where practical
- A unique, accurate meta description
- A self-referencing canonical URL
- Open Graph and social-sharing metadata
- One descriptive H1 and logical subordinate headings
- Descriptive internal link text

The site also includes Organization and SoftwareApplication JSON-LD. Docs pages
include BreadcrumbList JSON-LD. Structured data must not claim ratings, offers,
or facts that do not exist.

`robots.txt` allows public crawling and references the generated sitemap. The
sitemap contains only canonical, indexable pages.

## Technical architecture

The local `website/` directory is a self-contained Astro project with its own
`package.json` and lockfile. It is not added to the committed root workspace,
because GitHub must not receive scripts or workspace entries that reference
missing local-only source. It contains:

- `src/pages/` for marketing and utility routes
- `src/content/docs/` for public Markdown documentation
- `src/layouts/` for marketing and docs shells
- `src/components/` for navigation, footer, SEO, command blocks, callouts,
  stack cards, docs navigation, and structured data
- `src/styles/` for design tokens, global styles, and component styles
- `src/data/` for stable navigation and site metadata
- `public/` for icons, social images, `robots.txt`, and `CNAME`

Stack content is generated at build time from Loom's canonical `@loom/stacks`
package through a `file:../stacks` dependency. Site checks build that package
before importing its registry. The website must not maintain a second
handwritten list of public stack IDs.

Astro generates static HTML into `website/dist/`. The source and output are
ignored on `main` according to the user's repository policy.

## Deployment

The website source is never committed to `main`. Deployment is an intentional
local operation:

1. Install dependencies locally.
2. Run site checks and the production build.
3. Verify the generated output.
4. Publish only `website/dist/` to the orphan `gh-pages` branch.
5. Configure GitHub Pages to serve the `gh-pages` branch.
6. Configure DNS for `loom-dev.xyz` and retain `CNAME` in generated output.

The website package exposes this interface:

```bash
pnpm --dir website dev
pnpm --dir website check
pnpm --dir website build
pnpm --dir website deploy
```

The deploy script must refuse to publish when checks fail, when the output is
missing, or when the deployment target is not the expected repository and
branch. It must not modify the user's `main` working tree or reuse unresolved
paths for destructive cleanup.

Because source is absent from GitHub, GitHub Actions cannot rebuild this site.
There is no Pages build workflow in `main`; `gh-pages` contains only generated
static assets.

## Failure behavior

- Missing required SEO metadata fails the site check.
- A missing docs navigation target or broken internal link fails the site check.
- Missing or duplicate stack definitions fail the stack-page build.
- A stack count other than the canonical registry count fails verification.
- Invalid structured data fails verification.
- Unknown routes render the custom 404 page.
- Copy-button failure never hides or blocks the underlying command text.
- Stack-filter failure leaves the complete server-rendered list usable.
- Deployment stops before changing `gh-pages` when build or verification fails.

## Verification

Required local gates:

- Astro type and content checks
- Production build
- Internal-link and canonical-origin checks
- Unique title and description checks
- JSON-LD parsing and required-property checks
- Sitemap and robots validation
- Assertion that all canonical public stacks are present exactly once
- Browser smoke tests for home, stacks, docs, and 404 pages
- Keyboard navigation and representative accessibility checks
- Mobile and desktop responsive checks
- JavaScript-disabled content and navigation checks
- A deployment dry run that inspects the generated branch payload without
  pushing it

The release is ready when these gates pass and a fresh-reader test can install
Loom, create a first project, find a stack, navigate documentation, and recover
from common setup problems without repository knowledge.

## Out of scope for the first release

- Blog, changelog, accounts, billing, newsletter, analytics, comments, and search
  service integrations
- Server-rendered APIs or a runtime backend
- Production deployment guidance for Loom projects
- User testimonials or customer logos without real approved sources
- Automatic GitHub Actions deployment from `main`
- Committing website source or generated output to `main`
