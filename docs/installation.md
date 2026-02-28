# Loom Installation

Loom is a host-side CLI. It runs on your machine and orchestrates Podman containers.

## Prerequisites

- Podman installed
- Node.js 20+ (24 LTS recommended for local development)
- pnpm (for source/dev workflow)

## Install Podman + Node.js by OS

Use one environment per project (Linux, macOS, Windows Desktop, or WSL2) and install both Podman and Node.js there.

### Linux

Install Podman (pick your distro package manager):

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y podman

# Fedora/RHEL/CentOS Stream
sudo dnf install -y podman

# Arch
sudo pacman -S podman
```

Install Node.js 24 LTS (NodeSource):

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# Fedora/RHEL/CentOS Stream
curl -fsSL https://rpm.nodesource.com/setup_24.x | sudo bash -
sudo dnf install -y nodejs

# Arch
sudo pacman -S nodejs npm
```

Alternative: use `nvm` and install `node` (LTS) in your shell profile.

### macOS

Install Podman and Node.js with Homebrew:

```bash
brew install podman node
podman machine init
```

Loom auto-starts Podman Machine on `loom start`.

### Windows Desktop (PowerShell)

Install Podman and Node.js with winget:

```powershell
winget install RedHat.Podman
winget install OpenJS.NodeJS.LTS
```

Then initialize Podman Machine once:

```powershell
podman machine init
```

Loom auto-starts Podman Machine on `loom start`.

### WSL2

Inside your WSL distro terminal, follow the Linux steps above.

- Install Podman in WSL
- Install Node.js in WSL
- Run Loom from WSL for that project

Do not mix Windows-host and WSL-host Loom commands for the same running project.

### Verify prerequisites

Run in the same terminal context where you will run Loom:

```bash
podman version
node -v
```

`node -v` should be `>=20`.

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
Install scripts also warn (without failing) when Podman is installed but not currently reachable.

## How Loom runs by OS

- Linux: Loom talks to native rootless Podman.
- macOS/Windows: Loom manages Podman Machine lifecycle, then runs containers inside that VM.
- In all cases, Loom stays on the host; only app/proxy/db containers run in Podman.

## Windows Desktop vs WSL2

Loom supports both Windows Desktop and WSL2. Use one context per project at a time.

- Windows Desktop mode:
	- Run Loom from PowerShell/CMD on Windows.
	- Install Podman and Node.js on Windows.
	- Verify with `podman version` and `node -v`.
- WSL2 mode:
	- Run Loom inside your WSL distro terminal.
	- Install Podman and Node.js inside that distro.
	- Verify with `podman version` and `node -v` from WSL.
- Recommendation:
	- Do not run the same project from Windows and WSL interchangeably.
	- Keep one terminal context for install/start/stop/logs to avoid path/runtime mismatch.

## Verify installation

```bash
loom --help
loom status
```

Optional database backup check (for a running DB service):

```bash
loom backup db
```

## Database backups

Loom supports database backups for service types:

- `mysql`
- `mariadb`
- `postgres`
- `mongodb`
- `redis`
- `sqlite`
- `sqlserver`

Backup options:

```bash
# Backup a single service to default path
loom backup db

# Backup a single service to a custom file
loom backup db --output ./backups/db.sql

# Backup all supported DB services in the current project
loom backup --all
```

Backup files are written under `.loom/backups/` by default.
Services must be running before backup (`loom start`).

## Troubleshooting

- `loom: command not found`: ensure install dir is on `PATH`.
- Podman not reachable: run `podman version`.
- Podman Machine not running (macOS/Windows): run `loom start` (Loom auto-starts Podman Machine).

## Maintainer reference

- Release process: `docs/releasing.md`
