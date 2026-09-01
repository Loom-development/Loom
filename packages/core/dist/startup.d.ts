interface RouteBindingLike {
    host: string;
    service: string;
    targetPort: number;
    externalPort: number;
    https: boolean;
}
interface ProxyPortsLike {
    http: number;
    https: number;
}
interface HttpsInfoLike {
    certPath: string;
    keyPath: string;
}
export declare function formatStartupNotice(): string;
export declare function formatStartHeader(projectName: string, serviceCount: number, networkName: string): string;
export declare function formatStartedService(serviceName: string): string;
export declare function formatWaitingService(serviceName: string, detail: string, elapsedSeconds: number): string;
export declare function formatRouteBindings(routeBindings: RouteBindingLike[], proxyPorts?: ProxyPortsLike): string[];
export declare function formatProxyPorts(httpPort: number, httpsPort: number): string;
export declare function formatHttpsInfo(httpsInfo?: HttpsInfoLike): string[];
export declare function formatBrowserUrl(routeBindings: RouteBindingLike[], proxyPorts?: ProxyPortsLike): string[];
export {};
