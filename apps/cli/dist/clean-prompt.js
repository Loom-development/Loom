import { createInterface } from "node:readline/promises";
export function isCleanConfirmed(answer) {
    return /^(?:y|yes)$/i.test(answer.trim());
}
export async function confirmProjectClean(input = process.stdin, output = process.stdout) {
    const prompt = createInterface({ input, output });
    try {
        return isCleanConfirmed(await prompt.question("Remove these generated paths? [y/N] "));
    }
    finally {
        prompt.close();
    }
}
//# sourceMappingURL=clean-prompt.js.map