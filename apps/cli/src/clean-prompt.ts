import { createInterface } from "node:readline/promises";

export function isCleanConfirmed(answer: string): boolean {
  return /^(?:y|yes)$/i.test(answer.trim());
}

export async function confirmProjectClean(
  input: NodeJS.ReadableStream = process.stdin,
  output: NodeJS.WritableStream = process.stdout
): Promise<boolean> {
  const prompt = createInterface({ input, output });
  try {
    return isCleanConfirmed(await prompt.question("Remove these generated paths? [y/N] "));
  } finally {
    prompt.close();
  }
}
