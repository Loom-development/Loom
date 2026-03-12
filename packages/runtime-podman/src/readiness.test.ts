import test from "node:test";
import assert from "node:assert/strict";
import { waitForServiceReadyWithDependencies } from "./readiness.js";

test("waitForServiceReady accepts a healthy container", async () => {
  let calls = 0;

  await waitForServiceReadyWithDependencies(
    "demo",
    "app",
    { retries: 3, intervalSeconds: 1 },
    {
      inspectContainerByName: async () => {
        calls += 1;
        return {
          name: "demo-app",
          state: "running",
          running: true,
          health: calls === 2 ? "healthy" : "starting",
          image: "demo"
        };
      },
      sleep: async () => undefined,
      now: () => 0
    }
  );

  assert.equal(calls, 2);
});

test("waitForServiceReady requires two stable running checks when no explicit probe exists", async () => {
  let calls = 0;

  await waitForServiceReadyWithDependencies(
    "demo",
    "app",
    { retries: 3, intervalSeconds: 1 },
    {
      inspectContainerByName: async () => {
        calls += 1;
        return {
          name: "demo-app",
          state: "running",
          running: true,
          image: "demo"
        };
      },
      sleep: async () => undefined,
      now: () => 0
    }
  );

  assert.equal(calls, 2);
});

test("waitForServiceReady uses port reachability when ports are configured", async () => {
  let probeCalls = 0;

  await waitForServiceReadyWithDependencies(
    "demo",
    "app",
    { ports: ["8080:80"], retries: 2, intervalSeconds: 1 },
    {
      inspectContainerByName: async () => ({
        name: "demo-app",
        state: "running",
        running: true,
        image: "demo"
      }),
      arePortsReachable: async (ports) => {
        probeCalls += 1;
        assert.deepEqual(ports, [8080]);
        return true;
      },
      sleep: async () => undefined,
      now: () => 0
    }
  );

  assert.equal(probeCalls, 1);
});

test("waitForServiceReady rejects unhealthy containers", async () => {
  await assert.rejects(
    () =>
      waitForServiceReadyWithDependencies(
        "demo",
        "app",
        { retries: 1, intervalSeconds: 1 },
        {
          inspectContainerByName: async () => ({
            name: "demo-app",
            state: "running",
            running: true,
            health: "unhealthy",
            image: "demo"
          }),
          sleep: async () => undefined,
          now: () => 0
        }
      ),
    /reported unhealthy status/i
  );
});