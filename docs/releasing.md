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

If you need to pin Loom to a release (example: `v0.1.0`):

Linux/macOS:

```bash
export LOOM_VERSION="v0.1.0"
curl -fsSL https://raw.githubusercontent.com/Loom-development/Loom/main/scripts/install.sh | sh
```

Windows PowerShell:

```powershell
$env:LOOM_VERSION = "v0.1.0"
irm https://raw.githubusercontent.com/Loom-development/Loom/main/scripts/install.ps1 | iex
```

## Check your installed version

```bash
loom --help
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

## Release smoke

Before cutting a tag, run the ownership smoke against the generated Node, Python, Rails, WordPress, and django-react templates:

```bash
pnpm smoke:release
```

This script:

- generates fresh `node`, `python`, `rails7`, `php-wordpress`, and `django-react` projects,
- sets `HOST_UID` and `HOST_GID` to your current user,
- starts each stack with the installed `loom` binary,
- verifies that template-created files stay host-owned,
- stops each stack and cleans up.

The default release smoke still includes one multi-service template (`django-react`), but that template now avoids unnecessary root/bootstrap package installation so the smoke remains practical to run before every tag.

If a smoke fails, the temporary workspace is preserved and its path is printed so you can inspect the failing project.

## npm publishing

Tagged releases now also publish the npm CLI package `@loomdev/cli`.

If the repository has an `NPM_TOKEN` GitHub secret with permission to publish the `@loomdev` scope, a pushed tag like `v0.1.0` will build the package and upload it to the npmjs registry automatically.

Release workflow requirements:

- Add an `NPM_TOKEN` repository secret with publish access to the `@loomdev` scope.
- Create a version tag like `v0.1.0` and push it.

## Create a release

### 1. Bump the version

Update both `package.json` files to the same version:

```bash
# Bump CLI package (what gets published to npm)
cd apps/cli && npm version 0.2.9 --no-git-tag-version

# Sync root package.json to match
cd ../..
node -e "
const p = require('./package.json');
p.version = '0.2.9';
require('fs').writeFileSync('./package.json', JSON.stringify(p, null, 2) + '\n');
"
```

Or use `pnpm exec` to bump both:

```bash
pnpm exec --filter @loomdev/cli npm version 0.2.9 --no-git-tag-version
node -e "const p=require('./package.json');p.version='0.2.9';require('fs').writeFileSync('./package.json',JSON.stringify(p,null,2)+'\n');"
```

### 2. Verify everything is clean

```bash
pnpm install --frozen-lockfile
pnpm verify
```

### 3. Commit and tag

```bash
git add -A
git commit -m "v0.2.9"
git tag v0.2.9
git push origin main v0.2.9
```

When that tag is pushed, GitHub Actions will:

- install dependencies,
- run `pnpm verify:coverage`,
- build the standalone release archives,
- build and pack the npm CLI package,
- create a GitHub release for the tag,
- upload release assets from `dist/release`,
- publish `@loomdev/cli` to npm.

The dry-run workflow in `.github/workflows/release-dry-run.yml` builds and packs the npm CLI package into `dist/release` so publication issues are caught before tagging.

## Update to latest

Run the install command again. Loom will download the newest release package.

## Notes

- Node.js 24+ is required on your machine.
- Podman must be installed and reachable.
- Default release source is `Loom-development/Loom`.
