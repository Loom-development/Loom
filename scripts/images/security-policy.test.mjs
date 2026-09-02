import assert from "node:assert/strict";
import test from "node:test";

import { validateSecurityExceptions } from "./security-policy.mjs";

const now = new Date("2026-09-01T00:00:00Z");
const finding = { id: "CVE-2026-1000", fixedVersion: "1.2.3" };

test("accepts a documented active exception for a reported finding", () => {
  assert.deepEqual(
    validateSecurityExceptions([
      {
        id: finding.id,
        rationale: "Upstream rebuild is pending and exposure is not reachable.",
        owner: "@loom-security",
        expires: "2026-09-15"
      }
    ], now, [finding]),
    []
  );
});

test("accepts an exception expiring exactly 30 days from now", () => {
  assert.deepEqual(
    validateSecurityExceptions([
      {
        id: finding.id,
        rationale: "Upstream rebuild is pending.",
        owner: "@loom-security",
        expires: "2026-10-01"
      }
    ], now, [finding]),
    []
  );
});

test("rejects incomplete, expired, overlong, and stale exceptions", () => {
  assert.match(
    validateSecurityExceptions([
      { id: "CVE-1", rationale: "", owner: "", expires: "2026-09-15" },
      { id: "CVE-2", rationale: "Temporary", owner: "@owner", expires: "2026-08-31" },
      { id: "CVE-3", rationale: "Temporary", owner: "@owner", expires: "2026-10-02" },
      { id: "CVE-4", rationale: "Temporary", owner: "@owner", expires: "2026-09-15" }
    ], now, []).join("\n"),
    /rationale.*owner.*expired.*30 days.*not present/s
  );
});

test("rejects a fixable critical finding without an exception", () => {
  assert.deepEqual(
    validateSecurityExceptions([], now, [finding]),
    ["fixable critical vulnerability CVE-2026-1000 (fixed in 1.2.3) is not excepted"]
  );
});

test("reports the vulnerable package and upgrade path", () => {
  const detailedFinding = {
    ...finding,
    target: "usr/local/bin/example",
    packageName: "stdlib",
    installedVersion: "1.20.1"
  };

  assert.deepEqual(
    validateSecurityExceptions([], now, [detailedFinding]),
    [
      "fixable critical vulnerability CVE-2026-1000 in usr/local/bin/example:stdlib (1.20.1 -> 1.2.3) is not excepted"
    ]
  );
});
