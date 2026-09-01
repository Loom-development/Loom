interface RouteBindingLike {
    host: string;
    https: boolean;
}
interface HttpsInfo {
    certPath: string;
    keyPath: string;
}
type EnsureLocalCertificates = (projectName: string, hosts: string[]) => Promise<HttpsInfo>;
export declare function resolveHttpsInfo(projectName: string, routeBindings: RouteBindingLike[], ensureLocalCertificates: EnsureLocalCertificates): Promise<HttpsInfo | undefined>;
export declare function resolveProxyCertificateInfo(projectName: string, routeBindings: RouteBindingLike[], ensureLocalCertificates: EnsureLocalCertificates, existingInfo?: HttpsInfo): Promise<HttpsInfo>;
export {};
