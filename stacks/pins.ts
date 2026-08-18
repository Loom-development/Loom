export const runtimeImagePins = {
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/r/oven/bun
  bun1: "docker.io/oven/bun:1.2.18",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/node
  node22Alpine: "docker.io/library/node:22.17.1-alpine",
  node24Alpine: "docker.io/library/node:24.4.1-alpine"
} as const;

// Bootstrap generator versions live here once a stack uses a command generator.
export const generatorPins = {} as const;
