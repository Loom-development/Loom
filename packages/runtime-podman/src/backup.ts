import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { Writable } from "node:stream";
import type { LoomService } from "@loom/config";
import { containerName, isContainerRunning } from "./containers.js";

export interface BackupStrategy {
  extension: string;
  command: string[];
}

interface BackupChildProcess {
  stdout: {
    pipe: (target: Writable) => Writable;
  };
  stderr: {
    on(event: "data", listener: (chunk: string | Uint8Array) => void): unknown;
  };
  on(event: "error", listener: () => void): unknown;
  on(event: "close", listener: (code: number | null) => void): unknown;
  kill(): void;
}

interface BackupDependencies {
  isContainerRunningByName?: (name: string) => Promise<boolean>;
  makeDirectory?: (path: string, options: { recursive: boolean }) => Promise<unknown>;
  createOutputStream?: (path: string) => Writable;
  spawnBackupProcess?: (containerNameValue: string, command: string[]) => BackupChildProcess;
}

export const SUPPORTED_BACKUP_SERVICE_TYPES = [
  "mysql",
  "mariadb",
  "postgres",
  "mongodb",
  "redis",
  "sqlite",
  "sqlserver"
] as const;

export function databaseBackupStrategy(serviceType: string): BackupStrategy | null {
  const normalized = serviceType.toLowerCase();

  if (normalized === "mysql") {
    return {
      extension: "sql",
      command: [
        "sh",
        "-lc",
        "mysqldump -h 127.0.0.1 -uroot -p\"$MYSQL_ROOT_PASSWORD\" \"${MYSQL_DATABASE:-loom}\""
      ]
    };
  }

  if (normalized === "mariadb") {
    return {
      extension: "sql",
      command: [
        "sh",
        "-lc",
        "mariadb-dump -h 127.0.0.1 -uroot -p\"$MARIADB_ROOT_PASSWORD\" \"${MARIADB_DATABASE:-loom}\""
      ]
    };
  }

  if (normalized === "postgres") {
    return {
      extension: "sql",
      command: ["sh", "-lc", "pg_dump -U \"${POSTGRES_USER:-postgres}\" \"${POSTGRES_DB:-postgres}\""]
    };
  }

  if (normalized === "mongodb") {
    return {
      extension: "archive.gz",
      command: [
        "sh",
        "-lc",
        "mongodump --archive --gzip --authenticationDatabase admin --username \"${MONGO_INITDB_ROOT_USERNAME:-root}\" --password \"${MONGO_INITDB_ROOT_PASSWORD:-example}\" --db \"${MONGO_INITDB_DATABASE:-admin}\""
      ]
    };
  }

  if (normalized === "redis") {
    return {
      extension: "rdb",
      command: ["sh", "-lc", "redis-cli SAVE >/dev/null && cat /data/dump.rdb"]
    };
  }

  if (normalized === "sqlite") {
    return {
      extension: "db",
      command: ["sh", "-lc", "cat /data/loom.db"]
    };
  }

  if (normalized === "sqlserver" || normalized === "mssql") {
    return {
      extension: "bak",
      command: [
        "sh",
        "-lc",
        "mkdir -p /var/opt/mssql/backup && /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P \"$MSSQL_SA_PASSWORD\" -Q \"BACKUP DATABASE [master] TO DISK='/var/opt/mssql/backup/loom.bak' WITH INIT\" >/dev/null && cat /var/opt/mssql/backup/loom.bak"
      ]
    };
  }

  return null;
}

export function backupExtensionForServiceType(serviceType: string): string | null {
  return databaseBackupStrategy(serviceType)?.extension ?? null;
}

export async function backupServiceToFile(
  projectName: string,
  serviceName: string,
  service: LoomService,
  outputPath: string
): Promise<void> {
  return backupServiceToFileWithDependencies(projectName, serviceName, service, outputPath);
}

export async function backupServiceToFileWithDependencies(
  projectName: string,
  serviceName: string,
  service: LoomService,
  outputPath: string,
  dependencies: BackupDependencies = {}
): Promise<void> {
  const strategy = databaseBackupStrategy(service.type);
  if (!strategy) {
    throw new Error(
      `Service type '${service.type}' does not currently support 'loom backup'. Supported types: mysql, mariadb, postgres, mongodb, redis, sqlite, sqlserver.`
    );
  }

  const name = containerName(projectName, serviceName);
  const isContainerRunningByName = dependencies.isContainerRunningByName ?? isContainerRunning;
  const makeDirectory = dependencies.makeDirectory ?? mkdir;
  const createOutputStream = dependencies.createOutputStream ?? createWriteStream;
  const spawnBackupProcess =
    dependencies.spawnBackupProcess ??
    ((containerNameValue: string, command: string[]) =>
      spawn("podman", ["exec", "-i", containerNameValue, ...command], {
        stdio: ["ignore", "pipe", "pipe"]
      }));
  const running = await isContainerRunningByName(name);
  if (!running) {
    throw new Error(`Service '${serviceName}' is not running. Start it before creating a backup.`);
  }

  await makeDirectory(dirname(outputPath), { recursive: true });

  await new Promise<void>((resolve, reject) => {
    const child = spawnBackupProcess(name, strategy.command);
    const target = createOutputStream(outputPath);
    let stderr = "";
    let childExited = false;
    let streamFinished = false;
    let completed = false;

    const finish = (error?: Error) => {
      if (completed) {
        return;
      }

      completed = true;

      if (error) {
        reject(error);
        return;
      }

      resolve();
    };

    const maybeResolve = () => {
      if (childExited && streamFinished) {
        finish();
      }
    };

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", () => {
      target.destroy();
      finish(new Error(`Failed to run backup command for '${serviceName}'.`));
    });

    target.on("error", () => {
      child.kill();
      finish(new Error(`Failed to write backup file '${outputPath}'.`));
    });

    target.on("finish", () => {
      streamFinished = true;
      maybeResolve();
    });

    child.stdout.pipe(target);

    child.on("close", (code) => {
      if (code === 0) {
        childExited = true;
        maybeResolve();
        return;
      }

      finish(
        new Error(
          `Backup failed for service '${serviceName}': ${stderr.trim() || "unknown error"}`
        )
      );
    });
  });
}