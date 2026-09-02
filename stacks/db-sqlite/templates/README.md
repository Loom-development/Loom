# SQLite Template

This template gives you a lightweight SQLite environment stored as a local file.

## Quickstart

```bash
loom init db-sqlite --dir my-sqlite
cd my-sqlite
loom start
loom status
```

## Service

- `db`
  - Runtime: `${SQLITE_IMAGE:-ghcr.io/loom-development/loom-sqlite-3@sha256:d5a81b6eabeeaab23aea3fe72333df9ecc59ef3b316e85037d3bbf8936ce6b28}`
  - Port: none
  - Purpose: create and expose the SQLite database file under the project data directory

## Route

- None

## Image overrides

- `SQLITE_IMAGE`

## Backup and restore

```bash
loom backup db
loom restore db ./loom.db
```

SQLite restore replaces the mounted database file directly.
