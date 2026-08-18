export const runtimeImagePins = {
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/r/oven/bun
  bun1: "docker.io/oven/bun:1.2.18",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/node
  node22Alpine: "docker.io/library/node:22.17.1-alpine",
  node24Alpine: "docker.io/library/node:24.4.1-alpine",
  // Verified 2026-08-17 against Microsoft Artifact Registry: https://mcr.microsoft.com/v2/dotnet/sdk/manifests/8.0.412
  dotnet8Sdk: "mcr.microsoft.com/dotnet/sdk:8.0.412",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/maven
  maven39Temurin21: "docker.io/library/maven:3.9.11-eclipse-temurin-21",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/memcached
  memcached16Alpine: "docker.io/library/memcached:1.6.39-alpine",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/php
  php84Apache: "docker.io/library/php:8.4.10-apache",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/python
  python312Slim: "docker.io/library/python:3.12.11-slim"
} as const;

// Bootstrap generator versions live here once a stack uses a command generator.
export const generatorPins = {} as const;
