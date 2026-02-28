import { LoomOrchestrator } from "@loom/core";

export async function runNamedTask(orchestrator: LoomOrchestrator, taskName: string): Promise<void> {
  await orchestrator.runTask(taskName);
}
