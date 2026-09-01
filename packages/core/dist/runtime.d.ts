import type { LoomConfig } from "@loom/config";
import type { OrchestratorDependencies } from "./dependencies.js";
type RuntimeDependencies = Pick<OrchestratorDependencies, "ensureMachineRunning" | "detectPodmanCapabilities"> & {
    platform?: NodeJS.Platform;
    runtimeDirExists?: (path: string) => boolean;
    runtimeDir?: string;
    uid?: number;
};
export declare function ensureRuntimeReady(config: LoomConfig, dependencies: RuntimeDependencies): Promise<void>;
export {};
