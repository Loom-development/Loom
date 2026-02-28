import type { LoomService } from "@loom/config";
export interface CommandResult {
    ok: boolean;
    stdout: string;
    stderr: string;
    code: number;
}
export interface PodmanCapabilities {
    available: boolean;
    version?: string;
    rootless: boolean;
    machine: {
        supported: boolean;
        running: boolean;
    };
}
export interface ContainerSummary {
    name: string;
    state: string;
    running: boolean;
    health?: string;
    image: string;
}
export declare const SUPPORTED_BACKUP_SERVICE_TYPES: readonly ["mysql", "mariadb", "postgres", "mongodb", "redis", "sqlite", "sqlserver"];
export declare function runPodman(args: string[]): Promise<CommandResult>;
export declare function containerName(projectName: string, serviceName: string): string;
export declare function ensurePodmanNetwork(networkName: string): Promise<void>;
export declare function isContainerRunning(name: string): Promise<boolean>;
export declare function inspectContainer(name: string): Promise<ContainerSummary | null>;
export declare function listProjectContainers(projectName: string): Promise<ContainerSummary[]>;
export declare function waitForServiceReady(projectName: string, serviceName: string, options?: {
    ports?: string[];
    intervalSeconds?: number;
    timeoutSeconds?: number;
    retries?: number;
    startPeriodSeconds?: number;
}): Promise<void>;
export declare function ensureServiceStarted(projectName: string, serviceName: string, service: LoomService, networkName: string): Promise<void>;
export declare function stopService(projectName: string, serviceName: string): Promise<void>;
export declare function tailServiceLogs(projectName: string, serviceName: string, follow: boolean): Promise<void>;
export declare function execServiceCommand(projectName: string, serviceName: string, command: string[]): Promise<void>;
export declare function ensureComposerAvailable(projectName: string, serviceName: string): Promise<void>;
export declare function backupExtensionForServiceType(serviceType: string): string | null;
export declare function backupServiceToFile(projectName: string, serviceName: string, service: LoomService, outputPath: string): Promise<void>;
export declare function detectPodmanCapabilities(): Promise<PodmanCapabilities>;
export declare function ensureMachineRunning(managed: boolean): Promise<void>;
