import { defineStack } from "../definition.js";
import { runtimeImagePins } from "../pins.js";

export const dbPostgresStack = defineStack({
  id: "db-postgres", definitionVersion: 2, legacyScaffoldVersions: ["1"], assetPath: "db-postgres/templates", scaffoldVersion: "2",
  generator: { kind: "none" }, runtimeImages: [{ env: "POSTGRES_IMAGE", reference: runtimeImagePins.postgres16Alpine }],
  install: [], start: [], readiness: { kind: "command", value: "pg_isready -U loom", timeoutSeconds: 95 }, hostWrites: [],
  verification: ["pg_isready", "-U", "loom"], loomOwnedFiles: [".env.example", "loom.yaml"], generatedPaths: [], protectedPaths: [],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});
