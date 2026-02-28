import type { LoomConfig } from "./types.js";
export interface LoadedLoomProject {
    config: LoomConfig;
    configPath: string;
    projectRoot: string;
}
export declare function loadLoomProject(configPath?: string): Promise<LoadedLoomProject>;
export declare function loadLoomConfig(configPath?: string): Promise<LoomConfig>;
export type { LoomConfig, LoomRoute, LoomService, LoomTask } from "./types.js";
