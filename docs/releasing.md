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

Tagged releases now also publish the npm CLI package `@loom/cli`.

If the repository has an `NPM_TOKEN` GitHub secret with permission to publish the `@loom` scope, a pushed tag like `v0.1.0` will build the package and upload it to the npmjs registry automatically.

Release workflow requirements:

- Add an `NPM_TOKEN` repository secret with publish access to the `@loom` scope.
- Create a version tag like `v0.1.0` and push it.

## Create a release

The release workflow in `.github/workflows/release.yml` runs on tags that match `v*`.

Typical release flow:

```bash
git tag v0.1.0
git push origin v0.1.0
```

When that tag is pushed, GitHub Actions will:

- install dependencies,
- run `pnpm verify:coverage`,
- build the standalone release archives,
- build and pack the npm CLI package,
- create or update the GitHub release for that tag,
- upload files from `dist/release`,
- publish `@loom/cli` to npm.

If a GitHub release for the tag already exists, the workflow updates the title and replaces uploaded assets.

The release workflow will:

- verify the repository with coverage,
- build the standalone GitHub release archives,
- build and pack the npm CLI package,
- publish `@loom/cli` to npm,
- attach the standalone archives and packed npm tarball from `dist/release` to the GitHub release.

The dry-run workflow also builds and packs the npm CLI package into `dist/release` so package publication issues are caught before tagging.

## Update to latest

Run the install command again. Loom will download the newest release package.

## Notes

- Node.js 20+ is required on your machine.
- Podman must be installed and reachable.
- Default release source is `Loom-development/Loom`.
