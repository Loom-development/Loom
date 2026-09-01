import type { LoomConfig } from "@loom/config";
import type { OrchestratorDependencies } from "./dependencies.js";
export declare function listBackupSupportedServices(config: LoomConfig, backupExtensionForServiceType: (serviceType: string) => string | null): Array<[string, LoomConfig["services"][string]]>;
export declare function requireBackupExtension(serviceName: string, serviceType: string, supportedBackupServiceTypes: readonly string[], backupExtensionForServiceType: (serviceType: string) => string | null): string;
export declare function resolveBackupOutputPath(projectRoot: string, projectName: string, serviceName: string, extension: string, outputPath?: string, now?: Date): string;
type BackupDependencies = Pick<OrchestratorDependencies, "backupExtensionForServiceType" | "backupServiceToFile" | "listProjectContainers" | "supportedBackupServiceTypes">;
export declare function backupConfiguredService(config: LoomConfig, projectRoot: string, serviceName: string, dependencies: BackupDependencies, outputPath?: string): Promise<string>;
export declare function backupAllConfiguredServices(config: LoomConfig, projectRoot: string, dependencies: BackupDependencies): Promise<Array<{
    service: string;
    path: string;
}>>;
export {};
