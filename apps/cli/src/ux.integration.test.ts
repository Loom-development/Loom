import test from "node:test";
import assert from "node:assert/strict";
import { closeSync, mkdtempSync, openSync, readFileSync, rmSync } from "node:fs";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

function runCli(args: string[]) {
  const currentFileDir = dirname(fileURLToPath(import.meta.url));
  const cliPath = resolve(currentFileDir, "index.js");
  const captureDir = mkdtempSync(join(tmpdir(), "loom-cli-output-"));
  const stdoutPath = join(captureDir, "stdout");
  const stderrPath = join(captureDir, "stderr");
  const stdoutFd = openSync(stdoutPath, "w");
  const stderrFd = openSync(stderrPath, "w");

  try {
    const result = spawnSync(process.execPath, [cliPath, ...args], {
      encoding: "utf8",
      stdio: ["ignore", stdoutFd, stderrFd]
    });
    closeSync(stdoutFd);
    closeSync(stderrFd);

    return {
      ...result,
      stdout: readFileSync(stdoutPath, "utf8"),
      stderr: readFileSync(stderrPath, "utf8")
    };
  } finally {
    try {
      closeSync(stdoutFd);
    } catch {
      // already closed after a successful spawn
    }
    try {
      closeSync(stderrFd);
    } catch {
      // already closed after a successful spawn
    }
    rmSync(captureDir, { recursive: true, force: true });
  }
}

test("logs reports unknown service with suggestion and available services", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-logs-"));
  const configPath = join(tempRoot, "loom.yaml");
  await writeFile(
    configPath,
    [
      "version: 1",
      "name: ux-test",
      "runtime:",
      "  engine: podman",
      "  rootless: true",
      "services:",
      "  app:",
      "    type: node",
      "    image: node:20-alpine"
    ].join("\n"),
    "utf8"
  );

  const result = runCli(["logs", "ap", "--config", configPath, "--no-follow"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr || result.stdout, /Service 'ap' is not defined/i);
  assert.match(result.stderr || result.stdout, /Did you mean 'app'\?/i);
  assert.match(result.stderr || result.stdout, /Available services: app/i);
});

test("exec reports unknown service with suggestion", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-exec-"));
  const configPath = join(tempRoot, "loom.yaml");
  await writeFile(
    configPath,
    [
      "version: 1",
      "name: ux-test",
      "runtime:",
      "  engine: podman",
      "  rootless: true",
      "services:",
      "  app:",
      "    type: node",
      "    image: node:20-alpine"
    ].join("\n"),
    "utf8"
  );

  const result = runCli(["exec", "ap", "--config", configPath, "--", "echo", "hello"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr || result.stdout, /Service 'ap' is not defined/i);
  assert.match(result.stderr || result.stdout, /Did you mean 'app'\?/i);
});

test("help includes the restore command", () => {
  const result = runCli(["--help"]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /restore <service> <input>/i);
  assert.match(result.stdout, /upgrade/i);
});

test("upgrade reports a missing manifest", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "loom-cli-upgrade-"));
  const result = runCli(["upgrade", "--config", join(projectRoot, "loom.yaml")]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /No Loom project manifest/i);
});

test("upgrade migrates v1 baselines without replacing project files", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "loom-cli-upgrade-"));
  const loomYaml = "version: 1\nname: retained-name\nservices: {}\n";
  await mkdir(join(projectRoot, ".loom"), { recursive: true });
  await writeFile(join(projectRoot, "loom.yaml"), loomYaml);
  await writeFile(join(projectRoot, ".loom", "manifest.json"), JSON.stringify({
    version: 1,
    loomVersion: "0.1.0",
    stack: { id: "node", scaffoldVersion: "1" },
    ownedFiles: { "loom.yaml": { sha256: "old" } }
  }));

  const refused = runCli(["upgrade", "--config", join(projectRoot, "loom.yaml")]);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /--initialize-baseline/);
  assert.equal(await readFile(join(projectRoot, "loom.yaml"), "utf8"), loomYaml);

  const migrated = runCli(["upgrade", "--config", join(projectRoot, "loom.yaml"), "--initialize-baseline"]);
  assert.equal(migrated.status, 0, migrated.stderr);
  assert.match(migrated.stdout, /No project files were replaced/);
  assert.equal(await readFile(join(projectRoot, "loom.yaml"), "utf8"), loomYaml);
  const manifest = JSON.parse(await readFile(join(projectRoot, ".loom", "manifest.json"), "utf8")) as { version: number; renderInputs: { projectName: string } };
  assert.equal(manifest.version, 2);
  assert.equal(manifest.renderInputs.projectName, "retained-name");
});

test("upgrade rejects an unknown manifest stack", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "loom-cli-upgrade-"));
  await mkdir(join(projectRoot, ".loom"), { recursive: true });
  await writeFile(join(projectRoot, ".loom", "manifest.json"), JSON.stringify({
    version: 1,
    loomVersion: "0.1.0",
    stack: { id: "not-a-stack", scaffoldVersion: "1" },
    ownedFiles: {}
  }));
  const result = runCli(["upgrade", "--config", join(projectRoot, "loom.yaml")]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown stack 'not-a-stack'/);
});

test("upgrade skips modified Loom files unless forced and preserves developer files", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "loom-cli-upgrade-"));
  const initialized = runCli(["init", "node", "--dir", projectRoot]);
  assert.equal(initialized.status, 0, initialized.stderr);

  const configPath = join(projectRoot, "loom.yaml");
  const originalLoom = await readFile(configPath, "utf8");
  const current = runCli(["upgrade", "--config", configPath]);
  assert.equal(current.status, 0, current.stderr);
  assert.match(current.stdout, /unchanged loom\.yaml -> already current/);

  const modifiedLoom = `${originalLoom}\n# local Loom edit\n`;
  const developerFiles: Record<string, string> = {
    "package.json": '{"private":true}\n',
    "pnpm-lock.yaml": "lockfileVersion: '9.0'\n",
    ".env": "SECRET=keep-me\n"
  };
  await writeFile(configPath, modifiedLoom);
  for (const [path, contents] of Object.entries(developerFiles)) await writeFile(join(projectRoot, path), contents);

  const refused = runCli(["upgrade", "--config", configPath]);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stdout, /modified loom\.yaml -> skipped/);
  assert.equal(await readFile(configPath, "utf8"), modifiedLoom);

  const forced = runCli(["upgrade", "--config", configPath, "--force-modified"]);
  assert.equal(forced.status, 0, forced.stderr);
  assert.match(forced.stdout, /modified loom\.yaml -> update available/);
  assert.equal(await readFile(configPath, "utf8"), originalLoom);
  for (const [path, contents] of Object.entries(developerFiles)) {
    assert.equal(await readFile(join(projectRoot, path), "utf8"), contents);
  }
});
