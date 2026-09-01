import { buildPodmanRunArgs, containerExists, containerName, inspectContainer, inspectContainerImage, inspectContainerLabel, isContainerRunning, normalizeImage, removeContainer, serviceConfigHash, startContainer } from "./containers.js";
import { runPodman, runPodmanInherit } from "./podman.js";
function isInteractiveTerminal() {
    return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}
export function resolveRegistryHost(image) {
    const normalizedImage = normalizeImage(image);
    const [registryHost] = normalizedImage.split("/");
    return registryHost || "docker.io";
}
export function buildRegistryLoginHint(image) {
    const registryHost = resolveRegistryHost(image);
    return ` Try 'podman login ${registryHost}' and verify that the image tag exists and your account can access it.`;
}
export function isRegistryAuthError(detail) {
    return /(pull access denied|requested access to the resource is denied|authentication required|unauthorized|denied: requested access|insufficient_scope)/i.test(detail);
}
export function isImageUnavailableError(detail) {
    return /(manifest unknown|image not known|unable to pull|error locating image|repository does not exist)/i.test(detail);
}
function isMissingBindMountSourceError(detail) {
    return /(cannot stat .* no such file or directory|no such file or directory: oci runtime attempted to invoke a command that was not found)/i.test(detail);
}
function formatContainerRunError(name, image, detail) {
    const normalizedDetail = detail.trim() || "unknown error";
    if (isRegistryAuthError(normalizedDetail)) {
        return `Failed to run container '${name}' because image '${image}' requires registry access or authentication: ${normalizedDetail}${buildRegistryLoginHint(image)}`;
    }
    if (isImageUnavailableError(normalizedDetail)) {
        return `Failed to run container '${name}' because image '${image}' is not available or could not be pulled: ${normalizedDetail}`;
    }
    return `Failed to run container '${name}': ${normalizedDetail}`;
}
export function buildExecArgs(containerNameValue, command, interactiveTerminal, execUser, workdir) {
    if (command.length === 0) {
        throw new Error("Command required for loom exec.");
    }
    const ttyArgs = interactiveTerminal ? ["-it"] : [];
    const workdirArgs = workdir ? ["-w", workdir] : [];
    const userArgs = execUser ? ["--user", execUser] : [];
    return ["exec", ...ttyArgs, ...workdirArgs, ...userArgs, containerNameValue, ...command];
}
export async function ensureServiceStarted(projectName, serviceName, service, networkName) {
    return ensureServiceStartedWithDependencies(projectName, serviceName, service, networkName);
}
export async function ensureServiceStartedWithDependencies(projectName, serviceName, service, networkName, dependencies = {}) {
    const isContainerRunningByName = dependencies.isContainerRunningByName ?? isContainerRunning;
    const containerExistsByName = dependencies.containerExistsByName ?? containerExists;
    const inspectContainerImageByName = dependencies.inspectContainerImageByName ?? inspectContainerImage;
    const inspectContainerLabelByName = dependencies.inspectContainerLabelByName ?? inspectContainerLabel;
    const removeContainerByName = dependencies.removeContainerByName ?? removeContainer;
    const startContainerByName = dependencies.startContainerByName ?? startContainer;
    const buildRunArgs = dependencies.buildRunArgs ?? buildPodmanRunArgs;
    const runPodmanCommand = dependencies.runPodmanCommand ?? runPodman;
    const name = containerName(projectName, serviceName);
    const expectedImage = normalizeImage(service.image);
    const expectedServiceHash = serviceConfigHash(service);
    const running = await isContainerRunningByName(name);
    if (running) {
        return;
    }
    if (await containerExistsByName(name)) {
        const currentImage = await inspectContainerImageByName(name);
        const currentServiceHash = await inspectContainerLabelByName(name, "loom.service-hash");
        if ((currentImage && currentImage !== expectedImage) ||
            !currentServiceHash ||
            currentServiceHash !== expectedServiceHash) {
            await removeContainerByName(name);
        }
        else {
            try {
                await startContainerByName(name);
                return;
            }
            catch (error) {
                const detail = error instanceof Error ? error.message : String(error);
                if (!isMissingBindMountSourceError(detail)) {
                    throw error;
                }
                await removeContainerByName(name);
            }
        }
    }
    const args = await buildRunArgs(serviceName, name, service, networkName, expectedImage, expectedServiceHash);
    const runResult = await runPodmanCommand(args);
    if (!runResult.ok) {
        throw new Error(formatContainerRunError(name, service.image, runResult.stderr));
    }
}
export async function stopService(projectName, serviceName) {
    const name = containerName(projectName, serviceName);
    const exists = await runPodman(["container", "exists", name]);
    if (!exists.ok) {
        return;
    }
    const stop = await runPodman(["stop", name]);
    if (!stop.ok) {
        throw new Error(`Failed to stop container '${name}': ${stop.stderr || "unknown error"}`);
    }
}
export async function tailServiceLogs(projectName, serviceName, follow) {
    const name = containerName(projectName, serviceName);
    const args = ["logs", ...(follow ? ["-f"] : []), name];
    const code = await runPodmanInherit(args);
    if (code !== 0) {
        throw new Error(`Failed to fetch logs for '${name}'.`);
    }
}
export async function execServiceCommand(projectName, serviceName, command, execUser, workdir) {
    const name = containerName(projectName, serviceName);
    const args = buildExecArgs(name, command, isInteractiveTerminal(), execUser, workdir);
    const code = await runPodmanInherit(args);
    if (code !== 0) {
        throw new Error(`Failed to exec in '${name}'.`);
    }
}
function formatStoppedComposerContainerError(name, serviceName, state) {
    const stateDetail = state ? ` (state: ${state})` : "";
    return new Error(`Container '${name}' is not running${stateDetail}, so Composer could not be ensured. Check 'loom logs ${serviceName} --no-follow' for the startup failure.`);
}
export async function ensureComposerAvailable(projectName, serviceName) {
    return ensureComposerAvailableWithDependencies(projectName, serviceName);
}
export async function ensureComposerAvailableWithDependencies(projectName, serviceName, dependencies = {}) {
    const name = containerName(projectName, serviceName);
    const inspectContainerByName = dependencies.inspectContainerByName ?? inspectContainer;
    const runPodmanCommand = dependencies.runPodmanCommand ?? runPodman;
    const info = await inspectContainerByName(name);
    if (!info) {
        throw new Error(`Container '${name}' not found while ensuring Composer.`);
    }
    if (!info.running) {
        throw formatStoppedComposerContainerError(name, serviceName, info.state);
    }
    const result = await runPodmanCommand([
        "exec",
        name,
        "sh",
        "-c",
        "command -v composer >/dev/null 2>&1 || (EXPECTED_SIGNATURE=$(php -r \"copy('https://composer.github.io/installer.sig', 'php://stdout');\") && php -r \"copy('https://getcomposer.org/installer', 'composer-setup.php');\" && ACTUAL_SIGNATURE=$(php -r \"echo hash_file('sha384', 'composer-setup.php');\") && [ \"$EXPECTED_SIGNATURE\" = \"$ACTUAL_SIGNATURE\" ] && php composer-setup.php --install-dir=/usr/local/bin --filename=composer && rm -f composer-setup.php)"
    ]);
    if (!result.ok) {
        if (/can only create exec sessions on running containers|container state improper/i.test(result.stderr)) {
            const latestInfo = await inspectContainerByName(name);
            if (!latestInfo) {
                throw new Error(`Container '${name}' disappeared during composer check: ${result.stderr || "unknown error"}`);
            }
            if (!latestInfo.running) {
                throw formatStoppedComposerContainerError(name, serviceName, latestInfo.state);
            }
        }
        throw new Error(`Failed to ensure Composer in '${name}': ${result.stderr || "unknown error"}`);
    }
}
//# sourceMappingURL=lifecycle.js.map