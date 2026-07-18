# Loom — Marketing Copy

---

## One-liner

One command. Full stack. No Docker Desktop.

---

## Short pitch (for README headers, social, npm)

Loom is a local development CLI that gives you a ready-to-run app stack in minutes. Spin up Node, Python, PHP, Ruby, Java, or .NET projects with automatic HTTPS, databases, and local domain routing — powered by Podman.

---

## Hero copy (landing page)

### Stop wrestling with Docker. Start building.

You wanted to build a feature. Instead you spent two hours configuring Docker Compose, debugging port conflicts, and Googling "permission denied" errors.

Loom gives you a working dev environment in one command. Pick a template, and it just works — Node, Python, PHP, Ruby, Java, .NET, or a full MEAN/MERN stack. Databases, HTTPS, and nice local domains included.

No Docker Desktop. No license fees. No YAML archaeology.

```bash
loom init node --dir my-app
cd my-app && loom start
```

Your app is running at `https://my-app.loom.local`. Move on with your life.

---

## Features (bullet list)

**Templates that actually work.**
30+ starter templates. Generic language runtimes or framework-specific setups — Django, Rails, Symfony, Spring Boot, Next.js, Astro, and more. Every template starts without errors because we test them in CI.

**Databases without the pain.**
Add PostgreSQL, MySQL, MariaDB, MongoDB, or Redis in one flag. Loom generates credentials, wires the connection, and waits for the database to be ready before starting your app.

**Automatic HTTPS.**
Every project gets a local TLS certificate and a nice hostname like `https://myapp.loom.local`. No self-signed cert warnings. No editing `/etc/hosts` manually.

**Health checks that mean something.**
Loom waits for dependencies to actually be ready — not just "container started." Health checks, port probes, and startup grace periods keep your stack from racing itself.

**Host-aligned file permissions.**
Files written inside containers are owned by you, not root. No `sudo chown` after every `npm install`.

**Cross-platform.**
Works on Linux, macOS, and Windows. Podman handles the container runtime — free, open source, no license required.

**Backup and restore.**
One-command database backups and restores. Works with MySQL, PostgreSQL, MongoDB, Redis, and SQLite.

**Multiple projects, zero conflicts.**
Run several projects simultaneously. Each gets its own isolated network. A shared proxy handles routing so you don't need to juggle ports.

---

## Comparison table

| | Loom | Docker Compose | Laravel Sail | Laragon |
|---|---|---|---|---|
| One-command start | Yes | No | No | No |
| Free / no license | Yes | Yes* | Yes | Yes |
| Cross-platform | Yes | Yes | Yes | Windows only |
| Built-in HTTPS | Yes | Manual | Manual | Manual |
| DB backup/restore | Yes | Manual | Manual | Manual |
| Health-based startup | Yes | depends_on | No | No |
| Host file ownership | Yes | Manual | Manual | N/A |
| Requires Docker Desktop | No | Yes | Yes | N/A |

*Docker Desktop requires a paid license for commercial use in organizations with 250+ employees or $10M+ revenue.

---

## Template list (for docs or website)

**Starter apps:** Node, Bun, Python, PHP, .NET

**Frontend frameworks:** Astro, Next.js (T3), React (Vite), Angular (MEAN), Jamstack

**Backend frameworks:** Django, Flask, FastAPI, Rails, Symfony, Drupal, WordPress, Spring Boot

**Full-stack:** MERN (Mongo/Express/React/Node), MEAN (Mongo/Express/Angular/Node), Spring Boot + React, Django + React

**Databases:** PostgreSQL, MySQL, MariaDB, MongoDB, Redis, SQLite, SQL Server, Elasticsearch

---

## Target audience copy

### For beginners
You just finished a tutorial and want to build something real. You don't want to learn Docker. You don't want to configure Nginx. You just want `loom init` to give you a working project and `loom start` to make it go. It does.

### For experienced devs
You know Docker but you're tired of writing the same Compose file for the 40th time. You want health checks that actually work, permissions that don't require `sudo`, and backups you can run in one line. Loom is the tool you would have written yourself if you had the time.

### For teams
New team members clone the repo and run `loom start`. They don't read a 20-page setup guide. They don't file issues about port conflicts. They just start building. Loom enforces a consistent local environment without requiring everyone to become a DevOps engineer.

---

## Call to action

```bash
# Install
curl -fsSL https://raw.githubusercontent.com/Loom-development/Loom/main/scripts/install.sh | sh

# Create your first project
loom init node --dir hello-loom
cd hello-loom && loom start
```

Your app is at `https://hello-loom.loom.local`. Five minutes, two commands, zero Stack Overflow tabs.
