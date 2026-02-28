import test from "node:test";
import assert from "node:assert/strict";
import type { LoomConfig } from "@loom/config";
import { LoomOrchestrator } from "./index.js";

test("core exports are available", () => {
  assert.equal(typeof LoomOrchestrator, "function");
});

test("backupAll rejects when project has no backup-supported services", async () => {
  const config: LoomConfig = {
    version: 1,
    name: "no-db-project",
    runtime: { engine: "podman", rootless: true },
    services: {
      app: { type: "node", image: "node:20-alpine" }
    }
  };

  const orchestrator = new LoomOrchestrator(config, process.cwd());
  await assert.rejects(() => orchestrator.backupAll(), /No backup-supported services found/i);
});
