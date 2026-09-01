import type { LoomConfig, LoomTask } from "@loom/config";
export declare function getConfiguredTask(config: LoomConfig, taskName: string): LoomTask | undefined;
export declare function requireConfiguredTask(config: LoomConfig, taskName: string): LoomTask;
