import test from "node:test";
import assert from "node:assert/strict";

test("cli runtime is available", () => {
  assert.ok(process.version.length > 0);
});
