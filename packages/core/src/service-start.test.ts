import assert from "node:assert/strict";
import test from "node:test";
import type { LoomConfig } from "@loom/config";
import { startConfiguredService } from "./service-start.js";

function createConfig(serviceType: string): LoomConfig {
  return {
    version: 1,
    name: "demo",
    runtime: { engine: "podman", rootless: true },
    services: {
      app: {
        type: serviceType,
        image: `${serviceType}:latest`,
        ports: ["3000:3000"],
        healthcheck: {
          command: "curl -f http://127.0.0.1:3000/health"
        }
      }
    }
  };
}

test("startConfiguredService starts php services, ensures composer, and waits for readiness", async () => {
  const events: string[] = [];
  const output: string[] = [];

  await startConfiguredService(
    createConfig("php"),
    "app",
    "demo-net",
    {
      ensureServiceStarted: async (_projectName, serviceName) => {
        events.push(`start:${serviceName}`);
      },
      ensureComposerAvailable: async (_projectName, serviceName) => {
        events.push(`composer:${serviceName}`);
      },
      waitForServiceReady: async (_projectName, serviceName, healthcheck) => {
        events.push(`ready:${serviceName}`);
        assert.deepEqual(healthcheck, {
          command: "curl -f http://127.0.0.1:3000/health",
          ports: ["3000:3000"]
        });
      }
    },
    {
      writeOut(message) {
        output.push(message);
      }
    }
  );

  assert.deepEqual(events, ["start:app", "composer:app", "ready:app"]);
  assert.deepEqual(output, ["- started app\n"]);
});

test("startConfiguredService skips composer for non-php services", async () => {
  const events: string[] = [];

  await startConfiguredService(
    createConfig("node"),
    "app",
    "demo-net",
    {
      ensureServiceStarted: async (_projectName, serviceName) => {
        events.push(`start:${serviceName}`);
      },
      ensureComposerAvailable: async (_projectName, serviceName) => {
        events.push(`composer:${serviceName}`);
      },
      waitForServiceReady: async (_projectName, serviceName) => {
        events.push(`ready:${serviceName}`);
      }
    },
    {
      writeOut() {
        return undefined;
      }
    }
  );

  assert.deepEqual(events, ["start:app", "ready:app"]);
});