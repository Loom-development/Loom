# Loom Installation (Beginner Guide)

This guide is for people who just want to install Loom and start coding quickly.

## What you need first

- Podman
- Node.js 20+

Check both in your terminal:

```bash
podman version
node -v
```

## Step 1: Install Podman + Node.js

### Linux

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y podman nodejs npm

# Fedora
sudo dnf install -y podman nodejs npm
```

### macOS

```bash
brew install podman node
podman machine init
```

### Windows (PowerShell)

```powershell
winget install RedHat.Podman
winget install OpenJS.NodeJS.LTS
podman machine init
```

## Step 2: Install Loom

### Recommended: install from GitHub release script

Linux/macOS:

```bash
curl -fsSL https://raw.githubusercontent.com/Loom-development/Loom/main/scripts/install.sh | sh
```

Windows PowerShell:

```powershell
irm https://raw.githubusercontent.com/Loom-development/Loom/main/scripts/install.ps1 | iex
```

### Alternative: install from npm

```bash
npm install -g @loom/cli
```

## Step 3: Verify Loom works

```bash
loom --help
loom status
```

If this works, you are ready.

## Step 4: Start your first project

```bash
loom init node --dir my-app
cd my-app
loom start
loom status
```

When finished:

```bash
loom stop
```

## Most useful commands for beginners

- `loom init <template> --dir <folder>`
- `loom start`
- `loom start --recreate`
- `loom stop`
- `loom restart`
- `loom status`
- `loom ps`
- `loom logs <service> -f`
- `loom exec <service> -- <command>`

## Database backups (optional)

Supported service types:

- `mysql`
- `mariadb`
- `postgres`
- `mongodb`
- `redis`
- `sqlite`
- `sqlserver`

Examples:

```bash
loom backup db
loom backup db --output ./backups/db.sql
loom backup --all
```

## Troubleshooting

- **`loom: command not found`**: reopen terminal or add install location to `PATH`.
- **Podman not reachable**: run `podman version`.
- **Existing containers conflict with your current config**: run `loom start --recreate` to remove the current project's containers and rebuild them cleanly.
- **macOS/Windows Podman machine issues**: run `loom start` (Loom auto-handles machine start in normal flow).
- **Windows + WSL**: use one environment per project (don’t mix commands between Windows and WSL for the same running stack).
