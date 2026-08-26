# Versioned stack packages final-fix report

Date: 2026-08-26
Base commit: `880f572`

## Dispositions

1. **JavaScript environment defaults — fixed.** Astro, Bun, Jamstack, MEAN,
   MERN, T3, and Serverless now use their definition pins in `.env.example`.
   Environment equality coverage now visits every registered definition, and
   migration normalization/fixtures cover the seven newly corrected sources,
   including the stale Jamstack digest.
2. **Published CLI workspace dependency — fixed.** `@loom/stacks` is now a
   build-time development dependency. The bundled CLI remains self-contained,
   and the packed package has no runtime dependencies. A regression test runs
   `npm install` on the produced tarball in a fresh directory, invokes its
   installed `loom` binary, and verifies generated files and manifest metadata.
3. **Manifest definition version — fixed.** Manifest version 2 now loads an
   optional positive integer `definitionVersion`; the stronger new-manifest
   type and every write path require it. The current pre-field v2 scaffold
   value is explicitly registered as a legacy alias for every definition.
   Compatibility classification distinguishes current, legacy-compatible, and
   incompatible metadata. Upgrade rejects incompatible metadata and rewrites
   current scaffold and definition metadata after a compatible upgrade.
4. **Doctor image reproducibility — fixed.** The stable doctor result order now
   includes `images` immediately after `manifest`. It matches every service by
   service type against the selected stack pins plus database-definition pins
   named by `renderInputs.databases`. Exact images pass; overrides, including
   swapped approved images, warn deterministically and preserve exit code 0.
5. **Python cleanup paths — fixed.** Python, Django, Flask, and FastAPI declare
   `.pytest_cache`, `.venv`, and `__pycache__`. Django React declares
   `backend/.pytest_cache`, `backend/.venv`, `frontend/dist`, and
   `frontend/node_modules`. Exact lifecycle/maintenance assertions and
   representative cleanup execution cover Django and Django React.
6. **Two-component runtime tags — fixed.** Plain semver-like tags such as
   `node:24.4` are rejected. Patch tags, exact two-component variant tags such
   as `postgres:16.9-alpine`, date tags, and SQL Server CU tags remain valid.
7. **Secondary Symfony dependency — fixed.** A semantic assertion extracts the
   `symfony/webapp-pack` version, matches the canonical pin, and validates it as
   exact.
8. **Generator execution topology — fixed.** Command generators now declare
   typed container execution metadata for context, mount target, workdir, and
   environment. The shared bootstrap runner consumes this metadata and no
   longer infers topology from package names or public stack IDs.
9. **Legacy reference guard — fixed.** Markdown may explicitly describe the
   removed root generator layout, while child paths, operational instructions,
   active-layout claims, and non-Markdown references remain violations.

## Verification evidence

- `pnpm typecheck`
- `pnpm --filter @loom/stacks test`
- Focused CLI suites for manifest, upgrade, doctor, cleanup, bootstrap, init,
  and UX integration
- `node apps/cli/dist/package-assets.integration.test.js` — 5/5, including the
  actual tarball install and installed binary execution
- `pnpm verify` — lint, typecheck, and all workspace tests passed
- `git diff --check`

## Residual concerns

No blocking concern remains. Doctor's service-type table intentionally fails
closed as a warning for an unrecognized future runtime-image environment; a
new image environment must add its service-type entry alongside its stack
definition.
