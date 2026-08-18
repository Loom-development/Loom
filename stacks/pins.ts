export const runtimeImagePins = {
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/alpine
  alpine320: "docker.io/library/alpine:3.20.7",
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
  // Verified 2026-08-17 against Elastic Container Registry: https://docker.elastic.co/r/elasticsearch/elasticsearch
  elasticsearch817: "docker.elastic.co/elasticsearch/elasticsearch:8.17.10",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/mariadb
  mariadb118: "docker.io/library/mariadb:11.8.2",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/mongo
  mongo70: "docker.io/library/mongo:7.0.21",
  // Verified 2026-08-17 against Microsoft Artifact Registry: https://mcr.microsoft.com/v2/mssql/server/manifests/2022-CU20-ubuntu-22.04
  mssql2022: "mcr.microsoft.com/mssql/server:2022-CU20-ubuntu-22.04",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/mysql
  mysql84: "docker.io/library/mysql:8.4.6",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/php
  php84Apache: "docker.io/library/php:8.4.10-apache",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/postgres
  postgres16Alpine: "docker.io/library/postgres:16.9-alpine",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/python
  python312Slim: "docker.io/library/python:3.12.11-slim",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/redis
  redis74Alpine: "docker.io/library/redis:7.4.5-alpine"
} as const;

// Bootstrap generator versions live here once a stack uses a command generator.
export const generatorPins = {} as const;
