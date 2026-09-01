import type { LoomConfig } from "@loom/config";
type ConfiguredService = LoomConfig["services"][string];
interface ContainerLike {
    name: string;
    running: boolean;
}
export declare function getConfiguredService(config: LoomConfig, serviceName: string): ConfiguredService | undefined;
export declare function buildServiceNotFoundError(config: LoomConfig, serviceName: string, listProjectContainersByProject: (projectName: string) => Promise<ContainerLike[]>): Promise<Error>;
export declare function requireConfiguredService(config: LoomConfig, serviceName: string, listProjectContainersByProject: (projectName: string) => Promise<ContainerLike[]>): Promise<ConfiguredService>;
export {};
