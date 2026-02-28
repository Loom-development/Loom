import test from "node:test";
import assert from "node:assert/strict";
import {
  SUPPORTED_BACKUP_SERVICE_TYPES,
  backupExtensionForServiceType,
  buildExecArgs,
  containerName
} from "./index.js";

test("runtime exports are available", () => {
  assert.equal(containerName("proj", "svc"), "proj-svc");
  assert.ok(SUPPORTED_BACKUP_SERVICE_TYPES.length > 0);
});

test("backup extension mapping handles supported and unsupported service types", () => {
  assert.equal(backupExtensionForServiceType("postgres"), "sql");
  assert.equal(backupExtensionForServiceType("mongodb"), "archive.gz");
  assert.equal(backupExtensionForServiceType("not-a-db"), null);
});

test("buildExecArgs includes tty flags for interactive terminal", () => {
  const args = buildExecArgs("demo-app", ["node", "-v"], true);
  assert.deepEqual(args, ["exec", "-it", "demo-app", "node", "-v"]);
});

test("buildExecArgs omits tty flags for non-interactive terminal", () => {
  const args = buildExecArgs("demo-app", ["node", "-v"], false);
  assert.deepEqual(args, ["exec", "demo-app", "node", "-v"]);
});

test("buildExecArgs rejects empty command", () => {
  assert.throws(() => buildExecArgs("demo-app", [], false), /Command required for loom exec/i);
});
