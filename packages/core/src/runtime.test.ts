import assert from "node:assert/strict";
import test from "node:test";
import type { LoomConfig } from "@loom/config";
import { ensureRuntimeReady } from "./runtime.js";

function createConfig(): LoomConfig {
  return {
    version: 1,
    name: "demo",
    runtime: { engine: "podman", rootless: true },
    services: {
      app: { type: "node", image: "node:20-alpine" }
    }
  };
}

test("ensureRuntimeReady starts the managed machine before checking capabilities", async () => {
  const events: string[] = [];

  await ensureRuntimeReady(createConfig(), {
    ensureMachineRunning: async (managed) => {
      events.push(`machine:${String(managed)}`);
    },
    detectPodmanCapabilities: async () => {
      events.push("capabilities");
      return {
        available: true,
        version: "5.4.0",
        rootless: true,
        machine: {
          supported: false,
          running: true
        }
      };
    }
  });

  assert.deepEqual(events, ["machine:true", "capabilities"]);
});

test("ensureRuntimeReady rejects when Podman is unavailable", async () => {
  await assert.rejects(
    ensureRuntimeReady(createConfig(), {
      ensureMachineRunning: async () => undefined,
      detectPodmanCapabilities: async () => ({
        available: false,
        version: "0.0.0",
        rootless: false,
        machine: {
          supported: false,
          running: false
        }
      })
    }),
    /Podman is unavailable/
  );
});

test("ensureRuntimeReady rejects when rootless Podman is required but unavailable", async () => {
  await assert.rejects(
    ensureRuntimeReady(createConfig(), {
      ensureMachineRunning: async () => undefined,
      detectPodmanCapabilities: async () => ({
        available: true,
        version: "5.4.0",
        rootless: false,
        machine: {
          supported: false,
          running: true
        }
      })
    }),
    /requires rootless Podman/
  );
});