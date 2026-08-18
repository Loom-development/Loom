import type { DoctorResult } from "./project-doctor.js";

export function formatDoctorResults(results: readonly DoctorResult[]): string {
  const labels = { pass: "PASS", warning: "WARN", failure: "FAIL" } as const;
  return results.map((item) =>
    `[${labels[item.status]}] ${item.id}: ${item.summary}${item.detail ? ` — ${item.detail}` : ""}`
  ).join("\n") + (results.length ? "\n" : "");
}

export function formatDoctorJson(results: readonly DoctorResult[]): string {
  return `${JSON.stringify(results, null, 2)}\n`;
}

export function doctorExitCode(results: readonly DoctorResult[]): 0 | 1 {
  return results.some(({ status }) => status === "failure") ? 1 : 0;
}
