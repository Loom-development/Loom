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

#### Linux rootless Podman quick setup

Loom works best on Linux when Podman is running rootless.

You do not install a separate "rootless Podman" package. After installing Podman, a regular non-root user normally runs `podman` directly and it operates rootless by default.

```bash
# verify Podman is rootless as your normal user
podman info --format '{{.Host.Security.Rootless}}'

# if Loom later reports that /run/user/<uid> is missing,
# enable a persistent user runtime/session for this account
sudo loginctl enable-linger "$(whoami)"

# start a fresh login shell, then verify the runtime directory exists
ls -ld "/run/user/$(id -u)"
```

Expected result:

- `podman info --format '{{.Host.Security.Rootless}}'` prints `true`
- `/run/user/<your uid>` exists and is owned by your user when you have an active user session or lingering enabled

`loginctl enable-linger` is not required on every machine. It is mainly useful when your environment does not create `/run/user/<uid>` reliably for non-root shells. If it needs elevated privileges on your system, run it once with `sudo`.

You usually do not need to set `XDG_RUNTIME_DIR` manually. If `/run/user/$(id -u)` already exists but the variable is empty in your current shell, you can export it for that shell:

```bash
export XDG_RUNTIME_DIR="/run/user/$(id -u)"
```

Do not use that as a substitute for a missing runtime directory. If `/run/user/$(id -u)` does not exist, fix the user session first by logging in normally or enabling lingering.

You also do not need to enable `podman.socket` just to use Loom. Loom calls the `podman` CLI directly. This command is optional and is only needed if you use other tools that talk to Podman through its Docker-compatible API socket:

```bash
systemctl --user enable --now podman.socket
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

## Platform notes for permissions

- Linux with rootless Podman gives Loom the most reliable host-aligned file ownership when you use `userns: keep-id` and `user` in `loom.yaml`.
- macOS and Windows are supported through Podman machine. Loom will manage machine startup automatically during normal `loom start` flows.
- On macOS and Windows, `execUser` still makes `loom exec` and configured tasks run as the intended in-container user, but bind-mounted filesystem ownership and install performance may differ from native Linux because the project is accessed through the Podman VM.

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
npm install -g @loomdev/cli
```

### Install the CLI from a local checkout

If you are working from this repository and want to install the CLI on your machine from local source:

```bash
cd /home/bode/sites/loom.dev
pnpm install --frozen-lockfile
pnpm --dir apps/cli build
pnpm --dir apps/cli pack --pack-destination ../../dist/release
npm install -g "$(ls -1 dist/release/loomdev-cli-*.tgz | tail -n1)"
```

That builds the CLI package, packs it as a tarball, and installs the most recent local tarball globally so the `loom` command is available in your shell.

If you later rebuild the CLI, run the same `npm install -g "$(ls -1 dist/release/loomdev-cli-*.tgz | tail -n1)"` command again to refresh the global install.

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
- **Linux rootless Podman says `/run/user/<uid>` is missing**: Loom expects a real rootless user runtime directory for `userns: keep-id` workflows. Log in with a real user session or run `loginctl enable-linger $(id -u)` once, then start a new shell and retry.
- **`XDG_RUNTIME_DIR` is empty in the current shell**: if `/run/user/$(id -u)` already exists, run `export XDG_RUNTIME_DIR=/run/user/$(id -u)` in that shell and retry.
- **Existing containers conflict with your current config**: run `loom start --recreate` to remove the current project's containers and rebuild them cleanly.
- **macOS/Windows Podman machine issues**: run `loom start` (Loom auto-handles machine start in normal flow).
- **Windows + WSL**: use one environment per project (don’t mix commands between Windows and WSL for the same running stack).
- **Windows route hostnames**: when Loom runs directly on Windows, it attempts to add and remove Windows hosts entries for configured route hostnames automatically. This may require running the terminal with Administrator privileges. If automatic management fails, use the direct localhost URL shown by `loom start`, or add a hosts entry manually and open the route on `https://<host>:8443/`.
- **Windows + WSL route hostnames**: if Loom runs inside WSL, it cannot update the Windows hosts file. Add a Windows hosts entry like `127.0.0.1 wordpress.loom.local` manually and open `https://wordpress.loom.local:8443/`.
