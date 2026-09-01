import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DAY_MS = 24 * 60 * 60 * 1000;

function expiryDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value
    ? null
    : parsed;
}

export function validateSecurityExceptions(entries, now, findings = []) {
  const exceptions = Array.isArray(entries) ? entries : [];
  const currentTime = now instanceof Date ? now : new Date(now);
  const findingIds = new Set(findings.map(({ id }) => id));
  const errors = [];

  for (const entry of exceptions) {
    const label = entry?.id || "exception without an id";
    if (!entry?.id) errors.push(`${label} must include an id`);
    if (!entry?.rationale?.trim()) errors.push(`${label} must include a rationale`);
    if (!entry?.owner?.trim()) errors.push(`${label} must include an owner`);
    if (!expiryDate(entry?.expires)) errors.push(`${label} must include a valid expires date`);
  }

  for (const entry of exceptions) {
    const expires = expiryDate(entry?.expires);
    if (!expires) continue;

    const expiresAtEndOfDay = new Date(expires.getTime() + DAY_MS - 1);
    if (expiresAtEndOfDay < currentTime) {
      errors.push(`${entry.id} exception is expired`);
    } else if (expires.getTime() - currentTime.getTime() > 30 * DAY_MS) {
      errors.push(`${entry.id} exception may not extend more than 30 days`);
    }
  }

  for (const entry of exceptions) {
    if (entry?.id && !findingIds.has(entry.id)) {
      errors.push(`${entry.id} exception is not present in the vulnerability report`);
    }
  }

  const exceptedIds = new Set(exceptions.map(({ id }) => id));
  for (const finding of findings) {
    if (finding?.id && !exceptedIds.has(finding.id)) {
      errors.push(`fixable critical vulnerability ${finding.id} is not excepted`);
    }
  }

  return errors;
}

export function extractFixableCriticalFindings(report) {
  return (report?.Results ?? [])
    .flatMap(({ Vulnerabilities = [] }) => Vulnerabilities)
    .filter(({ Severity, FixedVersion }) => Severity === "CRITICAL" && FixedVersion)
    .map(({ VulnerabilityID, FixedVersion }) => ({
      id: VulnerabilityID,
      fixedVersion: FixedVersion
    }));
}

function run(argv) {
  const [exceptionsPath, reportPath] = argv;
  if (!exceptionsPath || !reportPath) {
    throw new Error("usage: security-policy.mjs <exceptions.json> <trivy-report.json>");
  }

  const exceptions = JSON.parse(fs.readFileSync(exceptionsPath, "utf8"));
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const errors = validateSecurityExceptions(
    exceptions,
    new Date(),
    extractFixableCriticalFindings(report)
  );

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  process.stdout.write("Image vulnerability policy passed.\n");
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    run(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
