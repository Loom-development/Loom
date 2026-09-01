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
export declare function createOrchestratorOutput(streams?: OutputStreams): OrchestratorOutput;
export declare const defaultOrchestratorOutput: OrchestratorOutput;
export {};
