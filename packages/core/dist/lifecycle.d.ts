export interface StopProjectResourcesOptions {
    stopServiceByName?: (projectName: string, serviceName: string) => Promise<void>;
    stopRouteProxyByProject?: (projectName: string) => Promise<void>;
    stopRouteHostsByProject?: (projectName: string) => Promise<void>;
    writeOut?: (message: string) => unknown;
    writeErr?: (message: string) => unknown;
}
export declare function stopProjectResources(projectName: string, order: string[], options?: StopProjectResourcesOptions): Promise<void>;
