export interface OrchestratorOutput {
  writeOut(message: string): void;
  writeErr(message: string): void;
}

export const defaultOrchestratorOutput: OrchestratorOutput = {
  writeOut(message: string) {
    process.stdout.write(message);
  },
  writeErr(message: string) {
    process.stderr.write(message);
  }
};