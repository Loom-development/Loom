# Spring + React Template

This template combines a Spring Boot backend with a React frontend for a classic full-stack split application, with the frontend calling the backend through a local `/api` proxy.

## Quickstart

```bash
loom init spring-react --dir my-spring-react
cd my-spring-react
loom start
loom status
```

## Services

- `backend`
  - Runtime: `${JAVA_IMAGE:-docker.io/library/maven:3.9-eclipse-temurin-21}`
  - Port: `8081`
  - Purpose: Spring Boot API
- `web`
  - Runtime: `${NODE_IMAGE:-docker.io/library/node:22-alpine}`
  - Port: `5175`
  - Purpose: built React frontend served locally with `/api` proxied to Spring Boot

## Endpoints

- Frontend: `GET /`
- Backend: `GET /api/health`
- Backend: `GET /api/hello`

## Route

- Frontend: `https://spring-react.loom.local`

## Image overrides

- `JAVA_IMAGE`
- `NODE_IMAGE`

## File permissions

This template keeps the existing `userns: keep-id` startup model because it does not need privileged package installation during `loom start`, but `loom exec` and task runs now use a host-aligned UID:GID by default through `execUser`. That keeps ad-hoc writes under the bind-mounted project tree aligned with the host user on Linux rootless Podman.

The backend exposes JSON endpoints and the frontend renders live data from Spring Boot instead of showing a static placeholder. Loom serves the built React app through a small local Node server, which is more stable in-container than running the Vite dev server directly.