export interface OrchestratorOutput {
  writeOut(message: string): void;
  writeErr(message: string): void;
}

interface OutputStreams {
  stdout: {
    isTTY?: boolean;
    write(message: string): void;
  };
  stderr: {
    write(message: string): void;
  };
}

function isTransientWaitingMessage(message: string): boolean {
  return /^- waiting for .+ readiness \(.+\)\n$/.test(message);
}

export function createOrchestratorOutput(streams: OutputStreams = { stdout: process.stdout, stderr: process.stderr }): OrchestratorOutput {
  let pendingInlineStatus = false;

  function flushInlineStatus(): void {
    if (!pendingInlineStatus) {
      return;
    }

    streams.stdout.write("\n");
    pendingInlineStatus = false;
  }

  return {
    writeOut(message: string) {
      if (streams.stdout.isTTY && isTransientWaitingMessage(message)) {
        streams.stdout.write(`\u001b[2K\r${message.trimEnd()}`);
        pendingInlineStatus = true;
        return;
      }

      flushInlineStatus();
      streams.stdout.write(message);
    },
    writeErr(message: string) {
      flushInlineStatus();
      streams.stderr.write(message);
    }
  };
}

export const defaultOrchestratorOutput: OrchestratorOutput = createOrchestratorOutput();