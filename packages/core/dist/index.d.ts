import type { LoomConfig } from "@loom/config";
import { type OrchestratorDependencies } from "./dependencies.js";
import { type OrchestratorOutput } from "./output.js";
export { stopProjectResources } from "./lifecycle.js";
import { type LoomStatus } from "./status.js";
export { formatStartupNotice } from "./startup.js";
export declare class LoomOrchestrator {
    private readonly config;
    private readonly projectRoot;
    private readonly dependencies;
    private readonly output;
    constructor(config: LoomConfig, projectRoot?: string, dependencies?: OrchestratorDependencies, output?: OrchestratorOutput);
    private recreateExistingProjectContainers;
    start(options?: {
        recreate?: boolean;
    }): Promise<void>;
    stop(): Promise<void>;
    restart(options?: {
        recreate?: boolean;
    }): Promise<void>;
    status(): Promise<LoomStatus>;
    ps(): Promise<Array<{
        name: string;
        state: string;
        running: boolean;
        health?: string;
        image: string;
    }>>;
    runTask(taskName: string): Promise<void>;
    logs(serviceName: string, follow?: boolean): Promise<void>;
    exec(serviceName: string, command: string[]): Promise<void>;
    backup(serviceName: string, outputPath?: string): Promise<string>;
    backupAll(): Promise<Array<{
        service: string;
        path: string;
    }>>;
    restore(serviceName: string, inputPath: string): Promise<string>;
}
