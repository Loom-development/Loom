export async function resolveHttpsInfo(projectName, routeBindings, ensureLocalCertificates) {
    const httpsHosts = routeBindings.filter((binding) => binding.https).map((binding) => binding.host);
    if (httpsHosts.length === 0) {
        return undefined;
    }
    return ensureLocalCertificates(projectName, httpsHosts);
}
export async function resolveProxyCertificateInfo(projectName, routeBindings, ensureLocalCertificates, existingInfo) {
    return existingInfo ?? ensureLocalCertificates(projectName, routeBindings.filter((b) => b.https).map((b) => b.host));
}
//# sourceMappingURL=https.js.map