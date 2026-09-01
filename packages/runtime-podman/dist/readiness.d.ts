import type { ContainerSummary } from "./types.js";
export interface ServiceReadinessOptions {
    command?: string;
    ports?: string[];
    intervalSeconds?: number;
    timeoutSeconds?: number;
    retries?: number;
    startPeriodSeconds?: number;
    progressIntervalSeconds?: number;
    onProgress?: (progress: {
        elapsedSeconds: number;
        detail: string;
    }) => void;
}
interface WaitForServiceReadyDependencies {
    inspectContainerByName?: (name: string) => Promise<ContainerSummary | null>;
    sleep?: (ms: number) => Promise<void>;
    arePortsReachable?: (ports: number[], timeoutMs: number) => Promise<boolean>;
    now?: () => number;
}
export declare function sleep(ms: number): Promise<void>;
export declare function isPortOpen(port: number, timeoutMs: number): Promise<boolean>;
export declare function arePortsReachable(ports: number[], timeoutMs: number): Promise<boolean>;
export declare function waitForServiceReady(projectName: string, serviceName: string, options?: ServiceReadinessOptions): Promise<void>;
export declare function waitForServiceReadyWithDependencies(projectName: string, serviceName: string, options: ServiceReadinessOptions | undefined, dependencies?: WaitForServiceReadyDependencies): Promise<void>;
export {};
