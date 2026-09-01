import type { Writable } from "node:stream";
import type { LoomService } from "@loom/config";
export interface BackupStrategy {
    extension: string;
    command: string[];
}
interface BackupChildProcess {
    stdout: {
        pipe: (target: Writable) => Writable;
    };
    stderr: {
        on(event: "data", listener: (chunk: string | Uint8Array) => void): unknown;
    };
    on(event: "error", listener: () => void): unknown;
    on(event: "close", listener: (code: number | null) => void): unknown;
    kill(): void;
}
interface BackupDependencies {
    isContainerRunningByName?: (name: string) => Promise<boolean>;
    makeDirectory?: (path: string, options: {
        recursive: boolean;
    }) => Promise<unknown>;
    createOutputStream?: (path: string) => Writable;
    spawnBackupProcess?: (containerNameValue: string, command: string[]) => BackupChildProcess;
}
interface RestoreDependencies {
    isContainerRunningByName?: (name: string) => Promise<boolean>;
    ensureInputReadable?: (path: string) => Promise<void>;
    prepareRestoreInput?: (serviceType: string, inputPath: string) => Promise<PreparedRestoreInput>;
    runPodmanCommand?: (args: string[]) => Promise<{
        ok: boolean;
        stdout: string;
        stderr: string;
        code: number;
    }>;
}
interface PreparedRestoreInput {
    path: string;
    cleanup?: () => Promise<void>;
}
export declare const SUPPORTED_BACKUP_SERVICE_TYPES: readonly ["mysql", "mariadb", "postgres", "mongodb", "redis", "sqlite", "sqlserver"];
export declare const SUPPORTED_RESTORE_SERVICE_TYPES: readonly ["mysql", "mariadb", "postgres", "mongodb", "redis", "sqlite"];
export declare function databaseBackupStrategy(serviceType: string): BackupStrategy | null;
export declare function backupExtensionForServiceType(serviceType: string): string | null;
interface RestoreStrategy {
    destinationPath: string;
    command?: string[];
}
export declare function databaseRestoreStrategy(serviceType: string): RestoreStrategy | null;
export declare function restoreSupportedForServiceType(serviceType: string): boolean;
export declare function backupServiceToFile(projectName: string, serviceName: string, service: LoomService, outputPath: string): Promise<void>;
export declare function backupServiceToFileWithDependencies(projectName: string, serviceName: string, service: LoomService, outputPath: string, dependencies?: BackupDependencies): Promise<void>;
export declare function restoreServiceFromFile(projectName: string, serviceName: string, service: LoomService, inputPath: string): Promise<void>;
export declare function restoreServiceFromFileWithDependencies(projectName: string, serviceName: string, service: LoomService, inputPath: string, dependencies?: RestoreDependencies): Promise<void>;
export {};
