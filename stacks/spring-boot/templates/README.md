# Spring Boot Template

This template gives you a Spring Boot application running on Java 21 (Eclipse Temurin), served from local project files.

## Quickstart

```bash
loom init spring-boot --dir my-app
cd my-app
loom start
loom status
```

## Services

- `app`
  - Runtime: `${JAVA_IMAGE:-ghcr.io/loom-development/loom-java-21@sha256:0137fa3f265b304b685757d5aea005a81140f833a49f271350b64bc0b349dedf}`
  - Port: `8080`
  - Purpose: Spring Boot application server with Maven wrapper

## Route

- App: `https://spring-boot.loom.local`

## Image overrides

- `JAVA_IMAGE`

## Healthcheck

The container healthcheck hits `/api/health`. The template includes `spring-boot-starter-actuator` so you can opt into full Actuator endpoints by configuring `application.properties`.

## File permissions

The container runs with `userns: keep-id` and `execUser` set to the host UID:GID so `mvn spring-boot:run` writes generated files (`.m2` cache, build output) with host-aligned ownership on Linux rootless Podman.
