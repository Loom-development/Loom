import type { LoomConfig } from "@loom/config";
import type { OrchestratorDependencies } from "./dependencies.js";
type RestoreDependencies = Pick<OrchestratorDependencies, "listProjectContainers" | "ensureServiceNetwork" | "restoreServiceFromFile" | "ensureServiceStarted" | "waitForServiceReady" | "stopService" | "supportedRestoreServiceTypes">;
export declare function resolveRestoreInputPath(projectRoot: string, inputPath: string): string;
export declare function requireRestoreSupport(serviceName: string, serviceType: string, supportedRestoreServiceTypes: readonly string[]): void;
export declare function restoreConfiguredService(config: LoomConfig, projectRoot: string, serviceName: string, inputPath: string, dependencies: RestoreDependencies): Promise<string>;
export {};
