import test from "node:test";
import assert from "node:assert/strict";
import {
  SUPPORTED_BACKUP_SERVICE_TYPES,
  backupExtensionForServiceType,
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
