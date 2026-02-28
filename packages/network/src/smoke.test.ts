import test from "node:test";
import assert from "node:assert/strict";
import type { LoomConfig } from "@loom/config";
import { projectNetworkName, resolveRouteBindings } from "./index.js";

test("network exports are available", () => {
  assert.equal(projectNetworkName("loom-app"), "loom-loom-app");
});

test("resolveRouteBindings maps published external port and defaults https=true", () => {
  const config: LoomConfig = {
    version: 1,
    name: "demo",
    runtime: { engine: "podman", rootless: true },
    services: {
      app: {
        type: "node",
        image: "node:20-alpine",
        ports: ["3001:3000"]
      }
    },
    routes: [{ host: "app.local", service: "app", port: 3000 }]
  };

  const bindings = resolveRouteBindings(config);
  assert.equal(bindings.length, 1);
  assert.equal(bindings[0].externalPort, 3001);
  assert.equal(bindings[0].https, true);
});

test("resolveRouteBindings throws for unknown service", () => {
  const config: LoomConfig = {
    version: 1,
    name: "demo",
    runtime: { engine: "podman", rootless: true },
    services: {},
    routes: [{ host: "broken.local", service: "missing", port: 8080 }]
  };

  assert.throws(() => resolveRouteBindings(config), /unknown service/i);
});

test("resolveRouteBindings rejects unsafe route host values", () => {
  const config: LoomConfig = {
    version: 1,
    name: "demo",
    runtime: { engine: "podman", rootless: true },
    services: {
      app: {
        type: "node",
        image: "node:20-alpine",
        ports: ["3001:3000"]
      }
    },
    routes: [{ host: "app.local {", service: "app", port: 3000 }]
  };

  assert.throws(() => resolveRouteBindings(config), /invalid/i);
});

test("resolveRouteBindings supports host/ip/protocol port mappings", () => {
  const config: LoomConfig = {
    version: 1,
    name: "demo",
    runtime: { engine: "podman", rootless: true },
    services: {
      app: {
        type: "node",
        image: "node:20-alpine",
        ports: ["127.0.0.1:3005:3000/tcp"]
      }
    },
    routes: [{ host: "app.local", service: "app", port: 3000 }]
  };

  const [binding] = resolveRouteBindings(config);
  assert.equal(binding.externalPort, 3005);
});
