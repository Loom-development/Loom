export function getConfiguredTask(config, taskName) {
    return config.tasks?.[taskName];
}
export function requireConfiguredTask(config, taskName) {
    const task = getConfiguredTask(config, taskName);
    if (!task) {
        throw new Error(`Task '${taskName}' is not defined in loom.yaml.`);
    }
    return task;
}
//# sourceMappingURL=tasks.js.map