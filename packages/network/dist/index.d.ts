import type { LoomConfig } from "@loom/config";
import type { CertificatePaths } from "@loom/https";
export interface RouteBinding {
    host: string;
    service: string;
    targetPort: number;
    externalPort: number;
    https: boolean;
}
export interface ProxyRuntime {
    containerName: string;
    httpPort: number;
    httpsPort: number;
}
export interface RouteHostManagementResult {
    managedHosts: string[];
    skippedHosts: string[];
    pendingHosts?: string[];
}
export declare function projectNetworkName(projectName: string): string;
export declare function applyManagedHostsEntries(content: string, projectName: string, hosts: string[]): string;
export declare function resolveRouteBindings(config: LoomConfig): RouteBinding[];
export declare function ensureServiceNetwork(config: LoomConfig): Promise<string>;
export declare function ensureRouteProxy(config: LoomConfig, bindings: RouteBinding[], certPaths: CertificatePaths, networkName: string, hostHttpPort?: number, hostHttpsPort?: number): Promise<ProxyRuntime>;
export declare function ensureRouteHosts(projectName: string, bindings: RouteBinding[]): Promise<RouteHostManagementResult>;
export declare function stopRouteProxy(projectName: string): Promise<void>;
export declare function stopRouteHosts(projectName: string): Promise<void>;
