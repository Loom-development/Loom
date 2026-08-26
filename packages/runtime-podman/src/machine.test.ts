import test from "node:test";
import assert from "node:assert/strict";
import {
  detectPodmanCapabilitiesWithDependencies,
  ensureMachineRunningWithDependencies
} from "./machine.js";
import type { CommandResult } from "./types.js";

function createResult(overrides: Partial<CommandResult>): CommandResult {
  return {
    ok: true,
    stdout: "",
    stderr: "",
    code: 0,
    ...overrides
  };
}

test("detectPodmanCapabilities reports unavailable Podman on linux", async () => {
  const capabilities = await detectPodmanCapabilitiesWithDependencies({
    platform: "linux",
    runPodmanCommand: async () => createResult({ ok: false, code: 1 })
  });

  assert.deepEqual(capabilities, {
    available: false,
    rootless: false,
    machine: {
      supported: false,
      running: false
    }
  });
});

test("detectPodmanCapabilities inspects rootless and machine state on macOS", async () => {
  const commands: string[] = [];
  const capabilities = await detectPodmanCapabilitiesWithDependencies({
    platform: "darwin",
    runPodmanCommand: async (args) => {
      commands.push(args.join(" "));
      if (args[0] === "version") {
        return createResult({ stdout: "5.4.0" });
      }

      if (args[0] === "info") {
        return createResult({ stdout: "true" });
      }

      return createResult({ stdout: "running" });
    }
  });

  assert.equal(capabilities.available, true);
  assert.equal(capabilities.version, "5.4.0");
  assert.equal(capabilities.rootless, true);
  assert.deepEqual(capabilities.machine, { supported: true, running: true });
  assert.deepEqual(commands, [
    "version --format {{.Version}}",
    "info --format {{.Host.Security.Rootless}}",
    "machine inspect --format {{.State}}"
  ]);
});

test("ensureMachineRunning starts and initializes the machine when managed", async () => {
  const commands: string[] = [];

  await ensureMachineRunningWithDependencies(true, {
    platform: "darwin",
    detectCapabilities: async () => ({
      available: true,
      rootless: true,
      machine: {
        supported: true,
        running: false
      }
    }),
    runPodmanCommand: async (args) => {
      commands.push(args.join(" "));
      if (commands.length === 1) {
        return createResult({ ok: false, stderr: "not initialized", code: 1 });
      }

      return createResult({ stdout: "ok" });
    }
  });

  assert.deepEqual(commands, ["machine start", "machine init", "machine start"]);
});

test("ensureMachineRunning rejects unmanaged stopped machines", async () => {
  await assert.rejects(
    () =>
      ensureMachineRunningWithDependencies(false, {
        platform: "darwin",
        detectCapabilities: async () => ({
          available: true,
          rootless: true,
          machine: {
            supported: true,
            running: false
          }
        }),
        runPodmanCommand: async () => createResult({})
      }),
    /Podman Machine is not running/i
  );
});