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

## npm publishing

Tagged releases now also publish the npm CLI package `@loom/cli`.

Release workflow requirements:

- Add an `NPM_TOKEN` repository secret with publish access to the `@loom` scope.
- Create a version tag like `v0.1.0` and push it.

The release workflow will:

- verify the repository with coverage,
- build the standalone GitHub release archives,
- build the npm CLI package,
- publish `@loom/cli` to npm,
- attach the standalone archives to the GitHub release.

The dry-run workflow also builds and packs the npm CLI package into `dist/release` so package publication issues are caught before tagging.

## Update to latest

Run the install command again. Loom will download the newest release package.

## Notes

- Node.js 20+ is required on your machine.
- Podman must be installed and reachable.
- Default release source is `Loom-development/Loom`.
