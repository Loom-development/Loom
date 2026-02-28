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

## Update to latest

Run the install command again. Loom will download the newest release package.

## Notes

- Node.js 20+ is required on your machine.
- Podman must be installed and reachable.
- Default release source is `Loom-development/Loom`.
