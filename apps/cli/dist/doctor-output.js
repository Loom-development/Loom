export function formatDoctorResults(results) {
    const labels = { pass: "PASS", warning: "WARN", failure: "FAIL" };
    return results.map((item) => `[${labels[item.status]}] ${item.id}: ${item.summary}${item.detail ? ` — ${item.detail}` : ""}`).join("\n") + (results.length ? "\n" : "");
}
export function formatDoctorJson(results) {
    return `${JSON.stringify(results, null, 2)}\n`;
}
export function doctorExitCode(results) {
    return results.some(({ status }) => status === "failure") ? 1 : 0;
}
//# sourceMappingURL=doctor-output.js.map