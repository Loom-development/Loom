import test from "node:test";
import assert from "node:assert/strict";
import type { LoomService } from "@loom/config";
import {
  buildPodmanRunArgs,
  normalizeImage,
  parseHostPorts,
  serviceConfigHash
} from "./containers.js";

test("normalizeImage prefixes library images and preserves registry paths", () => {
  assert.equal(normalizeImage("redis:7"), "docker.io/library/redis:7");
  assert.equal(normalizeImage("ghcr.io/demo/app:latest"), "ghcr.io/demo/app:latest");
});

test("parseHostPorts returns only valid host ports", () => {
  assert.deepEqual(parseHostPorts(["8080:80", "127.0.0.1:5432:5432", "invalid"]), [8080, 5432]);
});

test("serviceConfigHash is stable across env key ordering and changes on config changes", () => {
  const left: LoomService = {
    type: "node",
    image: "node:20-alpine",
    env: {
      B: "2",
      A: "1"
    }
  };
  const right: LoomService = {
    type: "node",
    image: "node:20-alpine",
    env: {
      A: "1",
      B: "2"
    }
  };
  const changed: LoomService = {
    type: "node",
    image: "node:22-alpine",
    env: {
      A: "1",
      B: "2"
    }
  };

  assert.equal(serviceConfigHash(left), serviceConfigHash(right));
  assert.notEqual(serviceConfigHash(left), serviceConfigHash(changed));
});

test("buildPodmanRunArgs includes labels, env, ports, and shell command", async () => {
  const service: LoomService = {
    type: "node",
    image: "node:20-alpine",
    command: "node server.js",
    workdir: "/workspace",
    entrypoint: "node",
    ports: ["3000:3000"],
    env: {
      NODE_ENV: "development"
    }
  };

  const args = await buildPodmanRunArgs(
    "app",
    "demo-app",
    service,
    "demo-net",
    "docker.io/library/node:20-alpine",
    "service-hash"
  );

  assert.deepEqual(args, [
    "run",
    "-d",
    "--name",
    "demo-app",
    "--network",
    "demo-net",
    "--network-alias",
    "app",
    "-w",
    "/workspace",
    "--entrypoint",
    "node",
    "-p",
    "3000:3000",
    "-e",
    "NODE_ENV=development",
    "--label",
    "loom.service-hash=service-hash",
    "docker.io/library/node:20-alpine",
    "sh",
    "-lc",
    "node server.js"
  ]);
});