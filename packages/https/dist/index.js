import { mkdir, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
function run(command, args) {
    return new Promise((resolvePromise, reject) => {
        const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
        let stderr = "";
        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });
        child.on("error", () => {
            reject(new Error(`Failed to run ${command}.`));
        });
        child.on("close", (code) => {
            if (code === 0) {
                resolvePromise();
                return;
            }
            reject(new Error(stderr.trim() || `${command} exited with code ${code ?? 1}`));
        });
    });
}
export async function ensureLocalCertificates(projectName, hosts) {
    const certDir = resolve(process.cwd(), ".loom", "certs");
    await mkdir(certDir, { recursive: true });
    const certPath = resolve(certDir, `${projectName}.crt`);
    const keyPath = resolve(certDir, `${projectName}.key`);
    try {
        await access(certPath, constants.F_OK);
        await access(keyPath, constants.F_OK);
        return { certPath, keyPath };
    }
    catch {
        const configPath = resolve(certDir, `${projectName}.openssl.cnf`);
        const uniqueHosts = Array.from(new Set(hosts));
        const sanEntries = uniqueHosts.map((host, index) => `DNS.${index + 1} = ${host}`).join("\n");
        const opensslConfig = `[req]
default_bits = 2048
prompt = no
default_md = sha256
x509_extensions = v3_req
distinguished_name = dn

[dn]
CN = ${projectName}.loom.local

[v3_req]
subjectAltName = @alt_names

[alt_names]
${sanEntries}
`;
        await writeFile(configPath, opensslConfig, "utf-8");
        await run("openssl", [
            "req",
            "-x509",
            "-nodes",
            "-days",
            "365",
            "-newkey",
            "rsa:2048",
            "-keyout",
            keyPath,
            "-out",
            certPath,
            "-config",
            configPath,
            "-extensions",
            "v3_req"
        ]);
        return { certPath, keyPath };
    }
}
//# sourceMappingURL=index.js.map