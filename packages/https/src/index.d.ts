export interface CertificatePaths {
    certPath: string;
    keyPath: string;
}
export declare function ensureLocalCertificates(projectName: string, hosts: string[]): Promise<CertificatePaths>;
