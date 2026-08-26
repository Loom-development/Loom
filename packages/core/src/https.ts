interface RouteBindingLike {
  host: string;
  https: boolean;
}

interface HttpsInfo {
  certPath: string;
  keyPath: string;
}

type EnsureLocalCertificates = (
  projectName: string,
  hosts: string[]
) => Promise<HttpsInfo>;

export async function resolveHttpsInfo(
  projectName: string,
  routeBindings: RouteBindingLike[],
  ensureLocalCertificates: EnsureLocalCertificates
): Promise<HttpsInfo | undefined> {
  const httpsHosts = routeBindings.filter((binding) => binding.https).map((binding) => binding.host);
  if (httpsHosts.length === 0) {
    return undefined;
  }

  return ensureLocalCertificates(projectName, httpsHosts);
}

export async function resolveProxyCertificateInfo(
  projectName: string,
  routeBindings: RouteBindingLike[],
  ensureLocalCertificates: EnsureLocalCertificates,
  existingInfo?: HttpsInfo
): Promise<HttpsInfo> {
  return existingInfo ?? ensureLocalCertificates(projectName, routeBindings.filter((b) => b.https).map((b) => b.host));
}