import type { LoomConfig } from "@loom/config";
export interface LoomStatus {
    project: string;
    podman: {
        available: boolean;
        version?: string;
        rootless: boolean;
        machineRunning: boolean;
    };
    services: Array<{
        name: string;
        image: string;
        container: string;
        running: boolean;
        state?: string;
        health?: string;
    }>;
    routes: Array<{
        host: string;
        target: string;
        https: boolean;
    }>;
    https?: {
        certPath: string;
        keyPath: string;
    };
    proxy?: {
        httpPort: number;
        httpsPort: number;
    };
}
export declare class LoomOrchestrator {
    private readonly config;
    private readonly projectRoot;
    constructor(config: LoomConfig, projectRoot?: string);
    private ensureRuntimeReady;
    private resolveHttpsInfo;
    private startServiceByName;
    private printRouteBindings;
    private getService;
    private requireService;
    private listBackupSupportedServices;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    status(): Promise<LoomStatus>;
    ps(): Promise<Array<{
        name: string;
        state: string;
        running: boolean;
        health?: string;
        image: string;
    }>>;
    runTask(taskName: string): Promise<void>;
    private serviceNotFoundError;
    logs(serviceName: string, follow?: boolean): Promise<void>;
    exec(serviceName: string, command: string[]): Promise<void>;
    backup(serviceName: string, outputPath?: string): Promise<string>;
    backupAll(): Promise<Array<{
        service: string;
        path: string;
    }>>;
}
