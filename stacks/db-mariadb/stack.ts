import { defineStack } from "../definition.js";
import { runtimeImagePins } from "../pins.js";

export const dbMariadbStack = defineStack({
  id: "db-mariadb", definitionVersion: 2, legacyScaffoldVersions: ["1"], assetPath: "db-mariadb/templates", scaffoldVersion: "2",
  generator: { kind: "none" }, runtimeImages: [{ env: "MARIADB_IMAGE", reference: runtimeImagePins.mariadb118 }],
  install: [], start: [],
  readiness: { kind: "command", value: "mariadb-admin ping -h 127.0.0.1 -uroot -ploomroot", timeoutSeconds: 100 },
  hostWrites: [], verification: ["mariadb-admin", "ping", "-h", "127.0.0.1", "-uroot", "-ploomroot"],
  loomOwnedFiles: [".env.example", "loom.yaml"], generatedPaths: [], protectedPaths: [],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});
