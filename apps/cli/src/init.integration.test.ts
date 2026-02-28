import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

function runCli(args: string[]) {
  const currentFileDir = dirname(fileURLToPath(import.meta.url));
  const cliPath = resolve(currentFileDir, "index.js");

  return spawnSync(process.execPath, [cliPath, ...args], {
    encoding: "utf8"
  });
}

test("init php defaults docroot to '.' when not provided", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "php-default");

  const result = runCli(["init", "php", "--dir", targetDir]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  assert.match(generatedConfig, /php -S 0\.0\.0\.0:80 -t \/var\/www\/html/);
});

test("init php-wordpress accepts php-docroot and reports ignore warning", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "wp-docroot");

  const result = runCli(["init", "php-wordpress", "--dir", targetDir, "--php-docroot", "public"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Ignoring --php-docroot for 'php-wordpress'/);
});

test("init db template defaults to ./db and creates .env", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const previousCwd = process.cwd();
  process.chdir(tempRoot);

  try {
    const result = runCli(["init", "db-postgres"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const generatedConfig = await readFile(join(tempRoot, "db", "loom.yaml"), "utf8");
    const generatedEnv = await readFile(join(tempRoot, "db", ".env"), "utf8");
    assert.match(generatedConfig, /name:\s*loom-db-postgres/i);
    assert.match(generatedEnv, /POSTGRES_USER=/);
    assert.match(result.stdout, /Initialized 'db-postgres' in .*\/db/);
  } finally {
    process.chdir(previousCwd);
  }
});

test("init rejects non-empty target directory without --force", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "non-empty");
  await mkdir(targetDir, { recursive: true });
  await writeFile(join(targetDir, "keep.txt"), "existing", "utf8");

  const result = runCli(["init", "php", "--dir", targetDir]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr || result.stdout, /not empty/i);
});

test("init allows non-empty target directory with --force", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "forced");
  await mkdir(targetDir, { recursive: true });
  await writeFile(join(targetDir, "keep.txt"), "existing", "utf8");

  const result = runCli(["init", "php", "--dir", targetDir, "--force"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  assert.match(generatedConfig, /name:\s*php-example/i);
});
