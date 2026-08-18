import { defineStack } from "../definition.js";
import { runtimeImagePins } from "../pins.js";

const start = "sh -c \"apk add --no-cache sqlite && sqlite3 /data/loom.db 'select 1;' && tail -f /dev/null\"";

export const dbSqliteStack = defineStack({
  id: "db-sqlite", definitionVersion: 2, legacyScaffoldVersions: ["1"], assetPath: "db-sqlite/templates", scaffoldVersion: "2",
  generator: { kind: "none" }, runtimeImages: [{ env: "SQLITE_IMAGE", reference: runtimeImagePins.alpine320 }],
  install: [], start: [start], readiness: { kind: "command", value: "sqlite3 /data/loom.db 'select 1;'", timeoutSeconds: 60 },
  hostWrites: [], verification: [{ service: "db", command: ["sqlite3", "/data/loom.db", "select 1;"] }], loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [], protectedPaths: [], compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});
