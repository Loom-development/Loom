import type { CommandResult, PodmanCapabilities } from "./types.js";
interface MachineDependencies {
    platform?: NodeJS.Platform;
    runPodmanCommand?: (args: string[]) => Promise<CommandResult>;
    detectCapabilities?: () => Promise<PodmanCapabilities>;
}
export declare function detectPodmanCapabilities(): Promise<PodmanCapabilities>;
export declare function detectPodmanCapabilitiesWithDependencies(dependencies?: MachineDependencies): Promise<PodmanCapabilities>;
export declare function ensureMachineRunning(managed: boolean): Promise<void>;
export declare function ensureMachineRunningWithDependencies(managed: boolean, dependencies?: MachineDependencies): Promise<void>;
export {};
