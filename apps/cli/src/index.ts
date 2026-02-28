#!/usr/bin/env node
import { cac } from "cac";
import { cp, mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLoomProject } from "@loom/config";
import { LoomOrchestrator } from "@loom/core";
import { runNamedTask } from "@loom/tasks";

const cli = cac("loom");

const templatesRoot = resolve(fileURLToPath(new URL("../../../examples", import.meta.url)));

const templateMap: Record<string, string> = {
  node: "node",
  "node-mean": "node/mean",
  "node-mern": "node/mern",
  "node-t3": "node/t3",
  python: "python",
  "python-django": "python/django",
  "python-flask": "python/flask",
  "python-fastapi": "python/fastapi",
  php: "php",
  "php-wordpress": "php/wordpress",
  "php-drupal": "php/drupal",
  "php-symfony": "php/symfony"
};

const ignoredTemplateEntries = new Set([
  "node_modules",
  ".pnpm-store",
  ".turbo",
  ".loom",
  "dist",
  ".next"
]);

function withErrorHandling<TArgs extends unknown[]>(fn: (...args: TArgs) => Promise<void>) {
  return (...args: TArgs) => {
    fn(...args).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${message}\n`);
      process.exitCode = 1;
    });
  };
}

async function bootstrapProject(configPath?: string): Promise<LoomOrchestrator> {
  const project = await loadLoomProject(configPath);
  process.chdir(project.projectRoot);
  return new LoomOrchestrator(project.config, project.projectRoot);
}

async function directoryHasFiles(path: string): Promise<boolean> {
  try {
    const entries = await readdir(path);
    return entries.length > 0;
  } catch {
    return false;
  }
}

cli
  .command("init <template>", "Initialize a sample project in a target directory")
  .option("--dir <path>", "Target directory", { default: "." })
  .option("--force", "Allow writing into non-empty target directory", { default: false })
  .action(
    withErrorHandling(async (template: string, options: { dir?: string; force?: boolean }) => {
      const relativeTemplate = templateMap[template];
      if (!relativeTemplate) {
        const available = Object.keys(templateMap).sort().join(", ");
        throw new Error(`Unknown template '${template}'. Available templates: ${available}`);
      }

      const sourceDir = resolve(templatesRoot, relativeTemplate);
      const targetDir = resolve(process.cwd(), options.dir ?? ".");

      await mkdir(targetDir, { recursive: true });

      if (!options.force && (await directoryHasFiles(targetDir))) {
        throw new Error(`Target directory '${targetDir}' is not empty. Use --force to continue.`);
      }

      await cp(sourceDir, targetDir, {
        recursive: true,
        force: options.force ?? false,
        filter: (sourcePath) => {
          const entryName = sourcePath.split("/").pop() ?? "";
          return !ignoredTemplateEntries.has(entryName);
        }
      });
      process.stdout.write(`Initialized '${template}' in ${targetDir}\n`);
      process.stdout.write(`Next: cd ${targetDir} && loom start\n`);
    })
  );

cli
  .command("start", "Start Loom project services")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .action(
    withErrorHandling(async (options: { config?: string }) => {
      const orchestrator = await bootstrapProject(options.config);
      await orchestrator.start();
    })
  );

cli
  .command("stop", "Stop Loom project services")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .action(
    withErrorHandling(async (options: { config?: string }) => {
      const orchestrator = await bootstrapProject(options.config);
      await orchestrator.stop();
    })
  );

cli
  .command("restart", "Restart Loom project services")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .action(
    withErrorHandling(async (options: { config?: string }) => {
      const orchestrator = await bootstrapProject(options.config);
      await orchestrator.restart();
    })
  );

cli
  .command("status", "Show project and runtime status")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .action(
    withErrorHandling(async (options: { config?: string }) => {
      const orchestrator = await bootstrapProject(options.config);
      const status = await orchestrator.status();
      process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
    })
  );

cli
  .command("ps", "List project containers")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .action(
    withErrorHandling(async (options: { config?: string }) => {
      const orchestrator = await bootstrapProject(options.config);
      const containers = await orchestrator.ps();
      process.stdout.write(`${JSON.stringify(containers, null, 2)}\n`);
    })
  );

cli
  .command("test", "Run test task from loom config")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .option("--task <name>", "Task name", { default: "test" })
  .action(
    withErrorHandling(async (options: { config?: string; task?: string }) => {
      const taskName = options.task ?? "test";
      const orchestrator = await bootstrapProject(options.config);
      await runNamedTask(orchestrator, taskName);
    })
  );

cli
  .command("logs <service>", "Show service logs")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .option("--follow", "Follow logs", { default: true })
  .action(
    withErrorHandling(async (service: string, options: { config?: string; follow?: boolean }) => {
      const orchestrator = await bootstrapProject(options.config);
      await orchestrator.logs(service, options.follow ?? true);
    })
  );

cli
  .command("exec <service> [...cmd]", "Exec command in service container")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .action(
    withErrorHandling(async (service: string, cmd: string[], options: { config?: string }) => {
      const orchestrator = await bootstrapProject(options.config);
      const passthroughIndex = process.argv.indexOf("--");
      const passthrough = passthroughIndex >= 0 ? process.argv.slice(passthroughIndex + 1) : [];
      await orchestrator.exec(service, cmd.length > 0 ? cmd : passthrough);
    })
  );

cli.help();
cli.version("0.1.0");

cli.parse();
