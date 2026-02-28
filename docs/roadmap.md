# Loom Implementation Roadmap

## Phase 1 - Foundation (In Progress)

- [x] pnpm monorepo scaffold.
- [x] Basic config schema and loader.
- [x] Podman availability/rootless/machine capability checks.
- [x] CLI commands: `loom start`, `loom status`, `loom test`.
- [ ] Compose import pathway.

## Phase 2 - Service Lifecycle

- [ ] Container create/start/stop and logs.
- [ ] Service dependency graph orchestration.
- [ ] Health checks and readiness gates.

## Phase 3 - Networking + HTTPS

- [ ] Routing layer for local hostnames.
- [ ] Automatic certificate issuance and trust setup.
- [ ] Cross-platform DNS integration strategy.

## Phase 4 - Build + Plugin Ecosystem

- [ ] Build hook runner (`preStart`, `build`, `postStop`).
- [ ] Plugin host runtime.
- [ ] Plugin SDK and template generator.

## Phase 5 - Hardening + Release

- [ ] Rootless permission edge-case handling.
- [ ] Podman Machine parity tests across macOS/Windows.
- [ ] CI matrix and release automation.
- [ ] Public documentation and contribution guides.
