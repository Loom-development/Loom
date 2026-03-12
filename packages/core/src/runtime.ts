import type { LoomConfig } from "@loom/config";
import type { OrchestratorDependencies } from "./dependencies.js";

type RuntimeDependencies = Pick<
  OrchestratorDependencies,
  "ensureMachineRunning" | "detectPodmanCapabilities"
>;

export async function ensureRuntimeReady(
  config: LoomConfig,
  dependencies: RuntimeDependencies
): Promise<void> {
  await dependencies.ensureMachineRunning(config.runtime.machine?.managed ?? true);
  const capabilities = await dependencies.detectPodmanCapabilities();

  if (!capabilities.available) {
    throw new Error("Podman is unavailable. Install Podman and retry `loom start`.");
  }

  if (config.runtime.rootless && !capabilities.rootless) {
    throw new Error("Loom config requires rootless Podman, but Podman is running rootful.");
  }
}