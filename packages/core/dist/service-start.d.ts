import type { LoomConfig } from "@loom/config";
import type { OrchestratorDependencies } from "./dependencies.js";
import type { OrchestratorOutput } from "./output.js";
type ServiceStartDependencies = Pick<OrchestratorDependencies, "ensureComposerAvailable" | "ensureServiceStarted" | "waitForServiceReady">;
type ServiceStartOutput = Pick<OrchestratorOutput, "writeOut">;
export declare function startConfiguredService(config: LoomConfig, serviceName: string, networkName: string, dependencies: ServiceStartDependencies, output: ServiceStartOutput): Promise<void>;
export {};
