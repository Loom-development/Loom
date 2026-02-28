import { access, readFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { constants } from "node:fs";
import { parse } from "yaml";
import { z } from "zod";
import type { LoomConfig } from "./types.js";

export interface LoadedLoomProject {
  config: LoomConfig;
  configPath: string;
  projectRoot: string;
}

const serviceSchema = z.object({
  type: z.string(),
  image: z.string(),
  entrypoint: z.string().optional(),
  command: z.string().optional(),
  workdir: z.string().optional(),
  ports: z.array(z.string()).optional(),
  volumes: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  dependsOn: z.array(z.string()).optional(),
  healthcheck: z
    .object({
      command: z.string(),
      intervalSeconds: z.number().int().positive().optional(),
      timeoutSeconds: z.number().int().positive().optional(),
      retries: z.number().int().positive().optional(),
      startPeriodSeconds: z.number().int().nonnegative().optional()
    })
    .optional()
});

const configSchema = z.object({
  version: z.number().int().positive(),
  name: z.string().min(1),
  runtime: z.object({
    engine: z.literal("podman"),
    rootless: z.boolean().default(true),
    machine: z
      .object({
        managed: z.boolean().default(true)
      })
      .optional()
  }),
  services: z.record(serviceSchema),
  routes: z
    .array(
      z.object({
        host: z.string(),
        service: z.string(),
        port: z.number().int().positive(),
        https: z.boolean().optional()
      })
    )
    .optional(),
  tasks: z
    .record(
      z.object({
        service: z.string(),
        command: z.string()
      })
    )
    .optional()
});

async function findConfigPath(configPath: string): Promise<string> {
  if (isAbsolute(configPath)) {
    return configPath;
  }

  let currentDir = process.cwd();

  while (true) {
    const candidate = resolve(currentDir, configPath);

    try {
      await access(candidate, constants.F_OK);
      return candidate;
    } catch {
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) {
        throw new Error(`Unable to find '${configPath}' from ${process.cwd()} or any parent directory.`);
      }

      currentDir = parentDir;
    }
  }
}

export async function loadLoomProject(configPath = "loom.yaml"): Promise<LoadedLoomProject> {
  const absolutePath = await findConfigPath(configPath);
  const raw = await readFile(absolutePath, "utf-8");
  const parsed = parse(raw);
  return {
    config: configSchema.parse(parsed) as LoomConfig,
    configPath: absolutePath,
    projectRoot: dirname(absolutePath)
  };
}

export async function loadLoomConfig(configPath = "loom.yaml"): Promise<LoomConfig> {
  const loaded = await loadLoomProject(configPath);
  return loaded.config;
}

export type { LoomConfig, LoomRoute, LoomService, LoomTask } from "./types.js";
