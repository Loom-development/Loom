import test from "node:test";
import assert from "node:assert/strict";
import { ensureLocalCertificates } from "./index.js";

test("https exports are available", () => {
  assert.equal(typeof ensureLocalCertificates, "function");
});
