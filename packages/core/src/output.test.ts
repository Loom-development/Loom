import assert from "node:assert/strict";
import test from "node:test";
import { createOrchestratorOutput } from "./output.js";

test("createOrchestratorOutput rewrites repeated readiness updates onto one line for tty stdout", () => {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const output = createOrchestratorOutput({
    stdout: {
      isTTY: true,
      write(message: string) {
        stdout.push(message);
      }
    },
    stderr: {
      write(message: string) {
        stderr.push(message);
      }
    }
  });

  output.writeOut("- started cache\n");
  output.writeOut("- waiting for app readiness (health: starting, 0s elapsed)\n");
  output.writeOut("- waiting for app readiness (health: starting, 17s elapsed)\n");
  output.writeOut("- started app\n");

  assert.deepEqual(stdout, [
    "- started cache\n",
    "\u001b[2K\r- waiting for app readiness (health: starting, 0s elapsed)",
    "\u001b[2K\r- waiting for app readiness (health: starting, 17s elapsed)",
    "\n",
    "- started app\n"
  ]);
  assert.deepEqual(stderr, []);
});

test("createOrchestratorOutput preserves newline output when stdout is not a tty", () => {
  const stdout: string[] = [];
  const output = createOrchestratorOutput({
    stdout: {
      isTTY: false,
      write(message: string) {
        stdout.push(message);
      }
    },
    stderr: {
      write() {
        return undefined;
      }
    }
  });

  output.writeOut("- waiting for app readiness (health: starting, 0s elapsed)\n");
  output.writeOut("- started app\n");

  assert.deepEqual(stdout, [
    "- waiting for app readiness (health: starting, 0s elapsed)\n",
    "- started app\n"
  ]);
});

test("createOrchestratorOutput flushes the inline readiness line before stderr output", () => {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const output = createOrchestratorOutput({
    stdout: {
      isTTY: true,
      write(message: string) {
        stdout.push(message);
      }
    },
    stderr: {
      write(message: string) {
        stderr.push(message);
      }
    }
  });

  output.writeOut("- waiting for app readiness (health: starting, 33s elapsed)\n");
  output.writeErr("startup failed\n");

  assert.deepEqual(stdout, [
    "\u001b[2K\r- waiting for app readiness (health: starting, 33s elapsed)",
    "\n"
  ]);
  assert.deepEqual(stderr, ["startup failed\n"]);
});