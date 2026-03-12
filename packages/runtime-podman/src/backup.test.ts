import test from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { Writable } from "node:stream";
import { EventEmitter } from "node:events";
import type { LoomService } from "@loom/config";
import { backupServiceToFileWithDependencies } from "./backup.js";

class FakeBackupProcess extends EventEmitter {
  stdout: { pipe: (target: Writable) => Writable };
  stderr = new EventEmitter();
  killed = false;

  constructor(writeToTarget: (target: Writable) => void) {
    super();
    this.stdout = {
      pipe: (target) => {
        writeToTarget(target);
        return target;
      }
    };
  }

  kill(): void {
    this.killed = true;
  }
}

class CollectingWritable extends Writable {
  chunks: string[] = [];

  override _write(
    chunk: string | Uint8Array,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    this.chunks.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"));
    callback();
  }

  contents(): string {
    return this.chunks.join("");
  }
}

const postgresService: LoomService = {
  type: "postgres",
  image: "postgres:16"
};

test("backupServiceToFile writes streamed backup output to disk", async () => {
  const child = new FakeBackupProcess((target) => {
    target.write("SELECT 1;\n");
    target.end();
  });
  const target = new CollectingWritable();

  const backupPromise = backupServiceToFileWithDependencies(
    "demo",
    "db",
    postgresService,
    "/tmp/backup.sql",
    {
      isContainerRunningByName: async () => true,
      makeDirectory: async () => undefined,
      createOutputStream: () => target,
      spawnBackupProcess: () => child
    }
  );

  setImmediate(() => {
    child.emit("close", 0);
  });

  await backupPromise;

  assert.equal(target.contents(), "SELECT 1;\n");
});

test("backupServiceToFile surfaces backup command failures", async () => {
  const child = new FakeBackupProcess((target) => {
    target.end();
  });
  const target = new CollectingWritable();

  const backupPromise = backupServiceToFileWithDependencies(
    "demo",
    "db",
    postgresService,
    "/tmp/backup.sql",
    {
      isContainerRunningByName: async () => true,
      makeDirectory: async () => undefined,
      createOutputStream: () => target,
      spawnBackupProcess: () => child
    }
  );

  setImmediate(() => {
    child.stderr.emit("data", Buffer.from("permission denied"));
    child.emit("close", 1);
  });

  await assert.rejects(() => backupPromise, /permission denied/i);
});

test("backupServiceToFile rejects when the service is not running", async () => {
  await assert.rejects(
    () =>
      backupServiceToFileWithDependencies(
        "demo",
        "db",
        postgresService,
        resolve("/tmp", "backup.sql"),
        {
          isContainerRunningByName: async () => false
        }
      ),
    /is not running/i
  );
});