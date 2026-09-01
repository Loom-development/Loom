# Loom Versions and Updates

This page is for users who want to install, pin, or update Loom versions.

## Install latest Loom

Linux/macOS:

```bash
curl -fsSL https://raw.githubusercontent.com/Loom-development/Loom/main/scripts/install.sh | sh
```

Windows PowerShell:

```powershell
irm https://raw.githubusercontent.com/Loom-development/Loom/main/scripts/install.ps1 | iex
```

## Install a specific version

If you need to pin Loom to a release (example: `v0.3.5`):

Linux/macOS:

```bash
export LOOM_VERSION="v0.3.5"
curl -fsSL https://raw.githubusercontent.com/Loom-development/Loom/main/scripts/install.sh | sh
```

Windows PowerShell:

```powershell
$env:LOOM_VERSION = "v0.3.5"
irm https://raw.githubusercontent.com/Loom-development/Loom/main/scripts/install.ps1 | iex
```

## Check your installed version

```bash
loom --version
```

## Release gates

Before release assets are built, Loom now runs the same repository verification gates used in CI:

```bash
pnpm verify:coverage
```

That covers lint, typecheck, workspace tests, and coverage reporting.

## Build release assets locally

Use this when you want to verify the release artifacts before creating a tag:

```bash
pnpm install --frozen-lockfile
pnpm verify:coverage
node scripts/build-release-assets.mjs
pnpm --dir apps/cli build
pnpm --dir apps/cli pack --pack-destination ../../dist/release
```

That produces the standalone archives and the packed npm tarball in `dist/release`.
The root `dist/` directory and package-level `dist/` directories are generated
output and are intentionally ignored by Git. Do not commit them; the release
workflow rebuilds them from the tagged source.

## Release smoke

Before cutting a tag, run the release smoke against the current representative
generated-stack set:

```bash
pnpm smoke:release
```

The current set covers Node, Python, Rails, WordPress, Django React, Flask,
FastAPI, PHP, Drupal, Rails Hotwire, and Astro. This script:

- generates fresh projects for every stack in the representative set,
- sets `HOST_UID` and `HOST_GID` to your current user,
- starts each stack with the installed `loom` binary,
- verifies that template-created files stay host-owned,
- stops each stack and cleans up.

The default release smoke still includes one multi-service template (`django-react`), but that template now avoids unnecessary root/bootstrap package installation so the smoke remains practical to run before every tag.

If a smoke fails, the temporary workspace is preserved and its path is printed so you can inspect the failing project.

## npm publishing

Tagged releases now also publish the npm CLI package `@loomdev/cli`.

If the repository has an `NPM_TOKEN` GitHub secret with permission to publish
the `@loomdev` scope, a pushed tag like `v0.3.5` will build the package and
upload it to the npmjs registry automatically.

Release workflow requirements:

- On npmjs.com, create a granular access token with read/write access to the
  `@loomdev` scope and enable **Bypass 2FA** for unattended publishing.
- In GitHub, open **Settings → Secrets and variables → Actions**, create a
  repository secret named `NPM_TOKEN`, and paste the token as its value.
- Never place the token in `.env`, `.npmrc`, a workflow file, or source control.
- Create a version tag like `v0.3.5` and push it.

## Create a release

### 1. Bump the version

Choose the release version and update both `package.json` files to match. For
example, to prepare `0.3.5`:

```bash
VERSION=0.3.5
npm version "$VERSION" --no-git-tag-version
npm --prefix apps/cli version "$VERSION" --no-git-tag-version
```

Confirm both values before continuing:

```bash
node -e "const root=require('./package.json');const cli=require('./apps/cli/package.json');if(root.version!==cli.version)process.exit(1);console.log(root.version)"
```

The release workflow accepts any tag beginning with `v`; it does not infer or
correct the package version. Before tagging, make sure the intended tag is
exactly `v` followed by the shared manifest version.

### 2. Verify everything is clean

```bash
pnpm install --frozen-lockfile
pnpm verify:coverage
pnpm smoke:release
git diff --check
```

Review `git status --short`. Only the intended source, documentation, and
version changes should be present; generated `dist/` output must remain
untracked.

### 3. Commit and tag

```bash
git add <intended-files>
git diff --cached --check
git diff --cached --stat
git commit -m "v0.3.5"
test "$(node -p "'v' + require('./apps/cli/package.json').version")" = "v0.3.5"
git tag v0.3.5
git push origin main v0.3.5
```

A tag that exists only on your machine does not trigger GitHub Actions and does
not create a GitHub Release. Confirm the tag reached the remote with:

```bash
git ls-remote --tags origin v0.3.5
```

When that tag is pushed, GitHub Actions will:

- install dependencies,
- run `pnpm verify:coverage`,
- build the standalone release archives,
- build and pack the npm CLI package,
- create a GitHub release for the tag,
- upload release assets from `dist/release`,
- publish `@loomdev/cli` to npm.

The dry-run workflow in `.github/workflows/release-dry-run.yml` builds and
packs the npm CLI package into `dist/release`. It catches build, package-content,
and archive problems before tagging, but it does not authenticate to npm or
attempt publication. Token validity, scope permissions, 2FA configuration, and
npm registry acceptance are checked only by the tagged release workflow.

After pushing the tag, verify the **Release** workflow succeeds in GitHub
Actions and that the matching entry appears on the repository's **Releases**
page. The GitHub Release is created before npm publication, so also confirm the
workflow's **Publish npm CLI package** step succeeded and query the exact npm
version:

```bash
npm view @loomdev/cli@0.3.5 version
```

Do not reuse or move a published version tag; fix the issue and publish a new
patch version instead.

## Update to latest

Run the install command again. Loom will download the newest release package.

## Notes

- Node.js 24+ is required on your machine.
- Podman must be installed and reachable.
- Default release source is `Loom-development/Loom`.
