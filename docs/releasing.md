# Loom Release Playbook

This guide defines how to publish GitHub Releases compatible with:

- `scripts/install.sh` (Linux/macOS)
- `scripts/install.ps1` (Windows)

## 1) Versioning

1. Bump version(s) as needed.
2. Create a git tag using semver, for example:

```bash
git tag v0.1.0
git push origin v0.1.0
```

## 2) Build CLI release assets

From repo root:

```bash
pnpm install
node scripts/build-release-assets.mjs
```

This creates all required archives under `dist/release/`.

## 3) Required release assets

For `scripts/install.sh`:

- `loom-linux-x64.tar.gz`
- `loom-linux-arm64.tar.gz`
- `loom-darwin-x64.tar.gz`
- `loom-darwin-arm64.tar.gz`

Each `.tar.gz` contains:

- `loom` (launcher script)
- `loom.mjs` (bundled CLI runtime)

For `scripts/install.ps1`:

- `loom-windows-x64.zip`
- `loom-windows-arm64.zip`

Each `.zip` contains:

- `loom.cmd` (launcher script)
- `loom.mjs` (bundled CLI runtime)

## 4) Automated GitHub Release workflow

`/.github/workflows/release.yml` builds all assets and publishes them on tags matching `v*`.

For pull requests, `/.github/workflows/release-dry-run.yml` builds the same assets and uploads them as a workflow artifact (no release publish).

Typical flow:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow uploads all required assets to the matching GitHub Release.

## 5) Publish GitHub Release (manual fallback)

1. Create a release for the tag (e.g. `v0.1.0`).
2. Upload all required assets listed above.
3. Mark as latest if appropriate.

## 6) Validate installers

Linux/macOS:

```bash
LOOM_REPO="Loom-development/Loom" LOOM_VERSION="v0.1.0" sh scripts/install.sh
loom --help
```

Windows PowerShell:

```powershell
$env:LOOM_REPO = "Loom-development/Loom"
$env:LOOM_VERSION = "v0.1.0"
./scripts/install.ps1
loom --help
```

## 7) Post-release checks

- Verify `releases/latest` download URLs work.
- Validate `loom --help` on Linux/macOS/Windows.
- Verify `loom start` against at least one sample config.

## Notes

- Install scripts default to `Loom-development/Loom`. Override with `LOOM_REPO` if needed.
- Keep asset names stable; installer scripts depend on them.
- Node.js 20+ is still required on user machines because launchers execute `loom.mjs`.
