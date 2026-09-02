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
  - Runtime: `${SQLITE_IMAGE:-docker.io/keinos/sqlite3:3.53.4}`
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
