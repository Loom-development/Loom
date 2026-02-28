import test from "node:test";
import assert from "node:assert/strict";
import { runNamedTask } from "./index.js";

test("tasks exports are available", () => {
  assert.equal(typeof runNamedTask, "function");
});

test("runNamedTask delegates to orchestrator.runTask", async () => {
  let calledWith = "";
  const orchestrator = {
    async runTask(taskName: string) {
      calledWith = taskName;
    }
  };

  await runNamedTask(orchestrator as never, "test-task");
  assert.equal(calledWith, "test-task");
});
