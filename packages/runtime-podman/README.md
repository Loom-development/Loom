# @loom/runtime-podman

Podman runtime adapter for Loom.

- Container/network lifecycle helpers
- Readiness checks
- Exec/log/backup primitives
- Internal modules are split by concern and re-exported through the package root.
- Public imports remain available from the package root so downstream packages do not need to change.

## Internal module boundaries

- `src/podman.ts`: low-level Podman command execution helpers.
- `src/containers.ts`: container naming, inspection, config hashing, host-port parsing, and run-argument assembly.
- `src/lifecycle.ts`: service startup and stop flows, exec/log helpers, and Composer bootstrap support.
- `src/readiness.ts`: readiness polling and port reachability checks.
- `src/backup.ts`: backup strategy selection and streaming backups to files.
- `src/machine.ts`: Podman capability detection and managed machine startup.
- `src/types.ts`: shared runtime helper types.

## Design intent

The package keeps a stable public surface through `src/index.ts`, while the internal split keeps Podman command execution, container inspection, lifecycle decisions, and backup/readiness behavior independently testable.
