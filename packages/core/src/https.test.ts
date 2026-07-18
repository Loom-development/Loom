import test from "node:test";
import assert from "node:assert/strict";
import { resolveHttpsInfo, resolveProxyCertificateInfo } from "./https.js";

test("resolveHttpsInfo returns undefined when no https routes exist", async () => {
  const info = await resolveHttpsInfo(
    "demo",
    [
      { host: "demo.test", https: false },
      { host: "api.demo.test", https: false }
    ],
    async () => {
      throw new Error("should not request certificates");
    }
  );

  assert.equal(info, undefined);
});

test("resolveHttpsInfo requests certificates only for https hosts", async () => {
  const requestedHosts: string[][] = [];

  const info = await resolveHttpsInfo(
    "demo",
    [
      { host: "demo.test", https: true },
      { host: "api.demo.test", https: false },
      { host: "secure.demo.test", https: true }
    ],
    async (_projectName, hosts) => {
      requestedHosts.push(hosts);
      return { certPath: "/tmp/cert.pem", keyPath: "/tmp/key.pem" };
    }
  );

  assert.deepEqual(requestedHosts, [["demo.test", "secure.demo.test"]]);
  assert.deepEqual(info, { certPath: "/tmp/cert.pem", keyPath: "/tmp/key.pem" });
});

test("resolveProxyCertificateInfo reuses existing info and skips redundant certificate generation", async () => {
  let called = false;

  const info = await resolveProxyCertificateInfo(
    "demo",
    [{ host: "demo.test", https: true }],
    async () => {
      called = true;
      return { certPath: "/tmp/cert.pem", keyPath: "/tmp/key.pem" };
    },
    { certPath: "/existing/cert.pem", keyPath: "/existing/key.pem" }
  );

  assert.equal(called, false);
  assert.deepEqual(info, { certPath: "/existing/cert.pem", keyPath: "/existing/key.pem" });
});

test("resolveProxyCertificateInfo requests certificates for all proxy hosts when https info is absent", async () => {
  const requestedHosts: string[][] = [];

  const info = await resolveProxyCertificateInfo(
    "demo",
    [
      { host: "demo.test", https: false },
      { host: "api.demo.test", https: true }
    ],
    async (_projectName, hosts) => {
      requestedHosts.push(hosts);
      return { certPath: "/tmp/cert.pem", keyPath: "/tmp/key.pem" };
    }
  );

  assert.deepEqual(requestedHosts, [["api.demo.test"]]);
  assert.deepEqual(info, { certPath: "/tmp/cert.pem", keyPath: "/tmp/key.pem" });
});