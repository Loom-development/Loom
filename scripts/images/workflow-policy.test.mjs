import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

test("pull-request image workflow builds and contracts both platforms without publishing", async () => {
  const workflow = await readFile(
    path.join(repositoryRoot, ".github/workflows/images-ci.yml"),
    "utf8"
  );

  assert.match(workflow, /^on:\n\s+pull_request:/m);
  assert.match(workflow, /^permissions:\n\s+contents: read$/m);
  assert.doesNotMatch(workflow, /packages:\s*write|push:\s*true|docker\/login-action/i);
  assert.match(workflow, /node scripts\/images\/matrix\.mjs custom/);
  assert.match(workflow, /linux\/amd64/);
  assert.match(workflow, /linux\/arm64/);
  assert.match(workflow, /node scripts\/images\/build\.mjs/);
  assert.match(workflow, /node scripts\/images\/test-image\.mjs/);
});
