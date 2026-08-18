import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const distDir = dirname(fileURLToPath(import.meta.url));
const repoDir = resolve(distDir, "..", "..");
const executeFile = promisify(execFile);

async function repositoryFiles(...args: string[]): Promise<string[]> {
  const { stdout } = await executeFile("git", ["ls-files", "-z", ...args], {
    cwd: repoDir,
    encoding: "utf8"
  });
  return stdout.split("\0").filter(Boolean);
}

test("active repository content has no legacy generator-path references", async () => {
  const searchableExtensions = new Set([".js", ".json", ".md", ".mjs", ".ps1", ".sh", ".ts", ".yaml", ".yml"]);
  const historicalMigrationDocs = [
    "docs/superpowers/plans/",
    "docs/superpowers/specs/2026-08-17-versioned-stacks-release-gate-design.md"
  ];
  const examplesPrefix = ["examples", ""].join("/");
  const runnablePrefix = `${examplesPrefix}runnable`;
  const legacyReference = new RegExp(`\\b${examplesPrefix}(?!runnable(?:/|\\b))`);
  const violations: string[] = [];

  for (const path of await repositoryFiles("--cached", "--others", "--exclude-standard")) {
    if (historicalMigrationDocs.some((prefix) => path.startsWith(prefix))) continue;
    if (path.startsWith(runnablePrefix)) continue;
    if (!searchableExtensions.has(extname(path))) continue;
    const absolutePath = resolve(repoDir, path);
    if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) continue;

    for (const [index, line] of readFileSync(absolutePath, "utf8").split("\n").entries()) {
      if (legacyReference.test(line)) violations.push(`${path}:${index + 1}:${line.trim()}`);
    }
  }

  assert.deepEqual(violations, []);
});

test("canonical stack packages contain no tracked generated artifacts", async () => {
  const generatedPath = /(?:^|\/)(?:\.angular|\.loom|\.next|\.pnpm-store|\.pytest_cache|\.turbo|\.venv|__pycache__|bin|build|data|dist|node_modules|obj|target|vendor)(?:\/|$)|(?:\.pyc|\.tsbuildinfo)$/;
  const violations = (await repositoryFiles("stacks")).filter((path) => generatedPath.test(path));

  assert.deepEqual(violations, []);
});

test("verified runnable boundary is the only examples content", () => {
  const examplesDir = resolve(repoDir, "examples");
  assert.deepEqual(readdirSync(examplesDir), ["runnable"]);
  assert.deepEqual(readdirSync(resolve(examplesDir, "runnable")), ["README.md"]);
});

test("generated-stack smoke initializes disposable projects by public ID", () => {
  const packageJson = JSON.parse(readFileSync(resolve(repoDir, "package.json"), "utf8")) as {
    scripts: Record<string, string>;
  };
  assert.equal(packageJson.scripts["smoke:examples"], undefined);
  assert.equal(packageJson.scripts["smoke:generated"], "./scripts/smoke-generated-stacks.sh");

  const smoke = readFileSync(resolve(repoDir, "scripts", "smoke-generated-stacks.sh"), "utf8");
  assert.match(smoke, /run_loom init "\$stack_id" --dir "\$project_dir"/);
  assert.doesNotMatch(smoke, /stacks\/[^\s]+\/templates\/loom\.yaml/);
});
