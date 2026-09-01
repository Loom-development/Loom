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
  assert.match(workflow, /aquasecurity\/trivy-action@v0\.36\.0/);
  assert.match(workflow, /format: json/);
  assert.match(workflow, /severity: CRITICAL/);
  assert.match(workflow, /ignore-unfixed: true/);
  assert.match(workflow, /node scripts\/images\/security-policy\.mjs/);
});

test("release workflow publishes only from main and signs the scanned manifest digest", async () => {
  const workflow = await readFile(
    path.join(repositoryRoot, ".github/workflows/images-release.yml"),
    "utf8"
  );

  assert.match(workflow, /push:\s*\n\s+branches:\s*\[main\]/);
  assert.doesNotMatch(workflow, /pull_request:/);
  assert.match(
    workflow,
    /permissions:\s*\n\s+contents: read\s*\n\s+packages: write\s*\n\s+id-token: write/
  );
  assert.match(workflow, /ghcr\.io\/loom-development/);
  assert.match(workflow, /docker:\/\/\$IMAGE/);
  assert.match(workflow, /podman manifest push --all/);
  assert.match(workflow, /skopeo inspect.*\.Digest/);
  assert.match(workflow, /aquasecurity\/trivy-action@v0\.36\.0/);
  assert.match(workflow, /node scripts\/images\/security-policy\.mjs/);
  assert.match(workflow, /sigstore\/cosign-installer@v4\.1\.2/);
  assert.match(workflow, /cosign sign --yes "\$IMAGE@\$DIGEST"/);
});
