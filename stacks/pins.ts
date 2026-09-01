export const runtimeImagePins = {
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/alpine
  alpine320: "docker.io/library/alpine:3.20.7",
  // Verified 2026-09-01 against Docker Hub: https://hub.docker.com/r/keinos/sqlite3
  sqlite346: "docker.io/keinos/sqlite3:3.46.1",
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
  // Verified 2026-09-01 against Docker Hub and a local extension probe.
  php84FpmApache: "docker.io/serversideup/php:8.4-fpm-apache@sha256:f21734838459f3c8c9e751e9d2cf20e5ee40fddf2153d16806fe1fcd6ebd49c5",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/ruby
  ruby338: "docker.io/library/ruby:3.3.8",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/wordpress
  wordpress682Php83Apache: "docker.io/library/wordpress:6.8.2-php8.3-apache",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/postgres
  postgres16Alpine: "docker.io/library/postgres:16.9-alpine",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/python
  python312Slim: "docker.io/library/python:3.12.11-slim",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/redis
  redis74Alpine: "docker.io/library/redis:7.4.5-alpine"
} as const;

export const generatorPins = {
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/composer
  composerImage: "docker.io/library/composer:2.8.10",
  // Verified 2026-08-17 against RubyGems: https://rubygems.org/gems/bundler/versions/2.6.9
  bundler: "2.6.9",
  // Verified 2026-08-17 against Packagist: https://packagist.org/packages/drupal/recommended-project
  drupalRecommendedProject: "11.2.2",
  // Verified 2026-08-17 against RubyGems: https://rubygems.org/gems/rails/versions/7.1.5
  rails: "7.1.5",
  // Verified 2026-08-17 against Packagist: https://packagist.org/packages/symfony/skeleton
  symfonySkeleton: "7.3.99",
  // Verified 2026-08-17 against Packagist: https://packagist.org/packages/symfony/webapp-pack
  symfonyWebappPack: "1.3.0",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/wordpress
  wordpress: "6.8.2"
} as const;
