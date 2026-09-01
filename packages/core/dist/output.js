function isTransientWaitingMessage(message) {
    return /^- waiting for .+ readiness \(.+\)\n$/.test(message);
}
export function createOrchestratorOutput(streams = { stdout: process.stdout, stderr: process.stderr }) {
    let pendingInlineStatus = false;
    function flushInlineStatus() {
        if (!pendingInlineStatus) {
            return;
        }
        streams.stdout.write("\n");
        pendingInlineStatus = false;
    }
    return {
        writeOut(message) {
            if (streams.stdout.isTTY && isTransientWaitingMessage(message)) {
                streams.stdout.write(`\u001b[2K\r${message.trimEnd()}`);
                pendingInlineStatus = true;
                return;
            }
            flushInlineStatus();
            streams.stdout.write(message);
        },
        writeErr(message) {
            flushInlineStatus();
            streams.stderr.write(message);
        }
    };
}
export const defaultOrchestratorOutput = createOrchestratorOutput();
//# sourceMappingURL=output.js.map