# Loom Installation

Loom is a host-side CLI. It runs on your machine and orchestrates Podman containers.

## Prerequisites

- Podman installed
- Node.js 20+ (24 LTS recommended for local development)
- pnpm (for source/dev workflow)

## Install methods

### 1) Development install from source (current repo)

```bash
pnpm install
pnpm --filter @loom/cli dev -- --help
```

### 2) Global install from npm (recommended when published)

```bash
npm install -g @loom/cli
loom --help
```

### 3) Install from GitHub Releases via shell (prepackaged CLI)

Set your repo once:

```bash
export LOOM_REPO="Loom-development/Loom"
```

Install latest on Linux/macOS:

```bash
curl -fsSL https://raw.githubusercontent.com/Loom-development/Loom/main/scripts/install.sh | sh
```

Install latest on Windows PowerShell:

```powershell
$env:LOOM_REPO = "Loom-development/Loom"
irm https://raw.githubusercontent.com/Loom-development/Loom/main/scripts/install.ps1 | iex
```

You can install a specific release by setting `LOOM_VERSION`, for example `v0.1.0`.

Note: release assets install a small launcher (`loom` or `loom.cmd`) plus `loom.mjs`, so Node.js 20+ must be installed on your host.

## How Loom runs by OS

- Linux: Loom talks to native rootless Podman.
- macOS/Windows: Loom manages Podman Machine lifecycle, then runs containers inside that VM.
- In all cases, Loom stays on the host; only app/proxy/db containers run in Podman.

## Verify installation

```bash
loom --help
loom status
```

## Troubleshooting

- `loom: command not found`: ensure install dir is on `PATH`.
- Podman not reachable: run `podman version`.
- Podman Machine not running (macOS/Windows): `podman machine start`.

## Maintainer reference

- Release process: `docs/releasing.md`
