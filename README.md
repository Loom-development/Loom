# Loom

Loom is an open-source, cross-platform local development tool powered by Podman.

## CI

- [![Release](https://github.com/Loom-development/Loom/actions/workflows/release.yml/badge.svg)](https://github.com/Loom-development/Loom/actions/workflows/release.yml)
- [![Release Dry Run](https://github.com/Loom-development/Loom/actions/workflows/release-dry-run.yml/badge.svg)](https://github.com/Loom-development/Loom/actions/workflows/release-dry-run.yml)

## Status

MVP command flow with real Podman lifecycle:

- `loom start`
- `loom stop`
- `loom restart`
- `loom status`
- `loom ps`
- `loom test`
- `loom logs <service>`
- `loom exec <service> -- <command>`

Readiness is enforced for every service during `loom start` in dependency order:

- Uses configured `healthcheck` when present.
- Falls back to host-port reachability when ports are published.
- Fails fast if a container exits before becoming ready.

For PHP services, Loom ensures `composer` is available inside the running container at startup.

## Networking + HTTPS (MVP)

- Loom creates a project Podman network: `loom-<project-name>`.
- Loom provisions a route proxy container (`caddy`) for configured routes.
- HTTPS certificates are generated automatically under `.loom/certs`.
- Rootless-compatible host proxy ports are used by default:
	- HTTP: `localhost:8080`
	- HTTPS: `localhost:8443`

## Quick start

```bash
pnpm install
pnpm --filter @loom/cli dev -- status
pnpm --filter @loom/cli dev -- start
pnpm --filter @loom/cli dev -- exec db -- sh -lc 'echo ok'
pnpm --filter @loom/cli dev -- logs db --no-follow
pnpm --filter @loom/cli dev -- stop
```

Installation guide: `docs/installation.md`

## Framework examples

- Node: MEAN, MERN in `examples/node`
- Python: Django, Flask, FastAPI in `examples/python`
- PHP: WordPress, Drupal, Symfony in `examples/php`
- Full examples matrix (ports/domains/config paths): `docs/examples-matrix.md`

Architecture flow diagram: see `docs/architecture.md` (Runtime Flow Diagram section).
