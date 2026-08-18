// Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/node
export const runtimeImagePins = {
  node24Alpine: "docker.io/library/node:24.4.1-alpine"
} as const;

// Bootstrap generator versions live here once a stack uses a command generator.
export const generatorPins = {} as const;
