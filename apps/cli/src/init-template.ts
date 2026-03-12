import { spawn } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

interface InitPreparationDependencies {
  directoryHasFiles?: (path: string) => Promise<boolean>;
  fileExists?: (path: string) => Promise<boolean>;
  readTextFile?: (path: string) => Promise<string>;
  runDrupalCreateProject?: (targetDir: string) => Promise<void>;
  runWordPressCreateProject?: (targetDir: string) => Promise<void>;
  runRailsCreateProject?: (targetDir: string) => Promise<void>;
  runRailsHotwireCreateProject?: (targetDir: string) => Promise<void>;
  runSymfonyCreateProject?: (targetDir: string) => Promise<void>;
}

interface InitPreparationResult {
  overwriteTemplateFiles: boolean;
  templateEntriesToUpdate?: string[];
  templateEntriesToCreateIfMissing?: string[];
}

interface DrupalCreateProjectDependencies {
  runCommand?: (command: string, args: string[], cwd: string) => Promise<void>;
}

interface WordPressCreateProjectDependencies {
  runCommand?: (command: string, args: string[], cwd: string) => Promise<void>;
}

interface RailsCreateProjectDependencies {
  runCommand?: (command: string, args: string[], cwd: string) => Promise<void>;
}

interface SymfonyCreateProjectDependencies {
  runCommand?: (command: string, args: string[], cwd: string) => Promise<void>;
}

const railsExecutable = "/usr/local/bundle/bin/rails";

async function directoryHasFiles(path: string): Promise<boolean> {
  try {
    const entries = await readdir(path);
    return entries.length > 0;
  } catch {
    return false;
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readTextFile(path: string): Promise<string> {
  return readFile(path, "utf8");
}

async function runCommand(command: string, args: string[], cwd: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stderr = "";

    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on("error", (error: unknown) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `Command '${command}' failed with exit code ${code ?? "unknown"}.`));
    });
  });
}

function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function resolveRegistryHost(image: string): string {
  const [registryHost] = image.split("/");
  return registryHost || "docker.io";
}

function buildRegistryLoginHint(image: string): string {
  const registryHost = resolveRegistryHost(image);
  return ` Try 'podman login ${registryHost}' and verify that the image tag exists and your account can access it.`;
}

function isRegistryAuthError(detail: string): boolean {
  return /(pull access denied|requested access to the resource is denied|authentication required|unauthorized|denied: requested access|insufficient_scope)/i.test(
    detail
  );
}

function isImageUnavailableError(detail: string): boolean {
  return /(manifest unknown|image not known|unable to pull|error locating image|repository does not exist)/i.test(
    detail
  );
}

function formatBootstrapError(context: string, image: string, error: unknown): Error {
  const detail = errorMessage(error).trim() || "unknown error";
  if (isRegistryAuthError(detail)) {
    return new Error(
      `Failed to initialize ${context} because image '${image}' requires registry access or authentication: ${detail}${buildRegistryLoginHint(image)}`
    );
  }

  if (isImageUnavailableError(detail)) {
    return new Error(
      `Failed to initialize ${context} because image '${image}' is not available or could not be pulled: ${detail}`
    );
  }

  return new Error(`Failed to initialize ${context}: ${detail}`);
}

export async function runDrupalCreateProjectWithDependencies(
  targetDir: string,
  dependencies: DrupalCreateProjectDependencies = {}
): Promise<void> {
  const execute = dependencies.runCommand ?? runCommand;
  const composerImage = "docker.io/library/composer:2";
  const createProjectArgs = ["create-project", "drupal/recommended-project", "."];

  const podmanArgs = [
    "run",
    "--rm",
    ...(process.platform === "linux" ? ["--userns=keep-id"] : []),
    "-v",
    `${targetDir}:/app`,
    "-w",
    "/app",
    composerImage,
    ...createProjectArgs
  ];

  try {
    await execute("podman", podmanArgs, targetDir);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      throw new Error(
        "Podman is required to initialize 'php-drupal'. Install Podman and retry 'loom init php-drupal'."
      );
    }

    throw formatBootstrapError("Drupal project with Podman Composer", composerImage, error);
  }
}

export async function runDrupalCreateProject(targetDir: string): Promise<void> {
  return runDrupalCreateProjectWithDependencies(targetDir);
}

export async function runWordPressCreateProjectWithDependencies(
  targetDir: string,
  dependencies: WordPressCreateProjectDependencies = {}
): Promise<void> {
  const execute = dependencies.runCommand ?? runCommand;
  const wordpressImage = "docker.io/library/wordpress:6.7-php8.3-apache";
  const podmanArgs = [
    "run",
    "--rm",
    ...(process.platform === "linux" ? ["--userns=keep-id"] : []),
    "-v",
    `${targetDir}:/app`,
    wordpressImage,
    "sh",
    "-lc",
    "cp -a /usr/src/wordpress/. /app/"
  ];

  try {
    await execute("podman", podmanArgs, targetDir);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      throw new Error(
        "Podman is required to initialize 'php-wordpress'. Install Podman and retry 'loom init php-wordpress'."
      );
    }

    throw formatBootstrapError("WordPress project with Podman", wordpressImage, error);
  }
}

export async function runWordPressCreateProject(targetDir: string): Promise<void> {
  return runWordPressCreateProjectWithDependencies(targetDir);
}

export async function runRailsCreateProjectWithDependencies(
  targetDir: string,
  dependencies: RailsCreateProjectDependencies = {}
): Promise<void> {
  const execute = dependencies.runCommand ?? runCommand;
  const rubyImage = "docker.io/library/ruby:3.3";
  const podmanArgs = [
    "run",
    "--rm",
    ...(process.platform === "linux" ? ["--userns=keep-id"] : []),
    "-v",
    `${targetDir}:/workspace`,
    "-w",
    "/workspace",
    rubyImage,
    "sh",
    "-lc",
    `gem install bundler --no-document && gem install rails -v 7.1.5 --no-document && ${railsExecutable} _7.1.5_ new . --skip-javascript --skip-test --skip-system-test`
  ];

  try {
    await execute("podman", podmanArgs, targetDir);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      throw new Error(
        "Podman is required to initialize 'rails7'. Install Podman and retry 'loom init rails7'."
      );
    }

    throw formatBootstrapError("Rails 7 project with Podman", rubyImage, error);
  }
}

export async function runRailsCreateProject(targetDir: string): Promise<void> {
  return runRailsCreateProjectWithDependencies(targetDir);
}

export async function runRailsHotwireCreateProjectWithDependencies(
  targetDir: string,
  dependencies: RailsCreateProjectDependencies = {}
): Promise<void> {
  const execute = dependencies.runCommand ?? runCommand;
  const rubyImage = "docker.io/library/ruby:3.3";
  const podmanArgs = [
    "run",
    "--rm",
    ...(process.platform === "linux" ? ["--userns=keep-id"] : []),
    "-v",
    `${targetDir}:/workspace`,
    "-w",
    "/workspace",
    rubyImage,
    "sh",
    "-lc",
    `gem install bundler --no-document && gem install rails -v 7.1.5 --no-document && ${railsExecutable} _7.1.5_ new . --skip-test --skip-system-test`
  ];

  try {
    await execute("podman", podmanArgs, targetDir);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      throw new Error(
        "Podman is required to initialize 'rails7-hotwire'. Install Podman and retry 'loom init rails7-hotwire'."
      );
    }

    throw formatBootstrapError("Rails 7 + Hotwire project with Podman", rubyImage, error);
  }
}

export async function runRailsHotwireCreateProject(targetDir: string): Promise<void> {
  return runRailsHotwireCreateProjectWithDependencies(targetDir);
}

export async function runSymfonyCreateProjectWithDependencies(
  targetDir: string,
  dependencies: SymfonyCreateProjectDependencies = {}
): Promise<void> {
  const execute = dependencies.runCommand ?? runCommand;
  const composerImage = "docker.io/library/composer:2";
  const podmanArgs = [
    "run",
    "--rm",
    ...(process.platform === "linux" ? ["--userns=keep-id"] : []),
    "-v",
    `${targetDir}:/app`,
    "-w",
    "/app",
    composerImage,
    "sh",
    "-lc",
    "composer create-project symfony/skeleton . && composer require symfony/webapp-pack"
  ];

  try {
    await execute("podman", podmanArgs, targetDir);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      throw new Error(
        "Podman is required to initialize 'php-symfony'. Install Podman and retry 'loom init php-symfony'."
      );
    }

    throw formatBootstrapError("Symfony project with Podman Composer", composerImage, error);
  }
}

export async function runSymfonyCreateProject(targetDir: string): Promise<void> {
  return runSymfonyCreateProjectWithDependencies(targetDir);
}

async function looksLikeDrupalProject(
  targetDir: string,
  dependencies: Pick<InitPreparationDependencies, "fileExists" | "readTextFile">
): Promise<boolean> {
  const hasFile = dependencies.fileExists ?? fileExists;
  const readText = dependencies.readTextFile ?? readTextFile;

  if (await hasFile(resolve(targetDir, "web", "index.php"))) {
    return true;
  }

  if (!(await hasFile(resolve(targetDir, "composer.json")))) {
    return false;
  }

  try {
    const composerJson = await readText(resolve(targetDir, "composer.json"));
    return /drupal\/(core|recommended-project|legacy-project)/i.test(composerJson);
  } catch {
    return false;
  }
}

async function looksLikeRailsProject(
  targetDir: string,
  dependencies: Pick<InitPreparationDependencies, "fileExists">
): Promise<boolean> {
  const hasFile = dependencies.fileExists ?? fileExists;
  return (
    (await hasFile(resolve(targetDir, "Gemfile"))) &&
    ((await hasFile(resolve(targetDir, "bin", "rails"))) ||
      (await hasFile(resolve(targetDir, "config", "application.rb"))))
  );
}

async function looksLikeWordPressProject(
  targetDir: string,
  dependencies: Pick<InitPreparationDependencies, "fileExists">
): Promise<boolean> {
  const hasFile = dependencies.fileExists ?? fileExists;
  return (
    (await hasFile(resolve(targetDir, "index.php"))) &&
    ((await hasFile(resolve(targetDir, "wp-config.php"))) ||
      (await hasFile(resolve(targetDir, "wp-content"))) ||
      (await hasFile(resolve(targetDir, "wp-includes", "version.php"))))
  );
}

async function looksLikeSymfonyProject(
  targetDir: string,
  dependencies: Pick<InitPreparationDependencies, "fileExists" | "readTextFile">
): Promise<boolean> {
  const hasFile = dependencies.fileExists ?? fileExists;
  const readText = dependencies.readTextFile ?? readTextFile;

  if ((await hasFile(resolve(targetDir, "bin", "console"))) || (await hasFile(resolve(targetDir, "config", "bundles.php")))) {
    return true;
  }

  if (!(await hasFile(resolve(targetDir, "composer.json")))) {
    return false;
  }

  try {
    const composerJson = await readText(resolve(targetDir, "composer.json"));
    return /symfony\/(framework-bundle|runtime|console|webapp-pack|skeleton)/i.test(composerJson);
  } catch {
    return false;
  }
}

export async function prepareInitTarget(
  template: string,
  targetDir: string,
  force: boolean,
  dependencies: InitPreparationDependencies = {}
): Promise<InitPreparationResult> {
  const hasFiles = dependencies.directoryHasFiles ?? directoryHasFiles;
  const nonEmpty = await hasFiles(targetDir);

  if (template === "php-drupal") {
    if (nonEmpty) {
      if (await looksLikeDrupalProject(targetDir, dependencies)) {
        return {
          overwriteTemplateFiles: true,
          templateEntriesToUpdate: ["loom.yaml"],
          templateEntriesToCreateIfMissing: [".env.example"]
        };
      }

      throw new Error(
        `Target directory '${targetDir}' must be empty to initialize '${template}' because Loom runs composer create-project in that directory.`
      );
    }

    const bootstrapDrupal = dependencies.runDrupalCreateProject ?? runDrupalCreateProject;
    await bootstrapDrupal(targetDir);
    return { overwriteTemplateFiles: false };
  }

  if (template === "php-wordpress") {
    if (nonEmpty) {
      if (await looksLikeWordPressProject(targetDir, dependencies)) {
        return {
          overwriteTemplateFiles: true,
          templateEntriesToUpdate: ["loom.yaml"],
          templateEntriesToCreateIfMissing: [".env.example", "wp-config.php"]
        };
      }

      throw new Error(
        `Target directory '${targetDir}' must be empty to initialize '${template}' because Loom bootstraps WordPress files in that directory.`
      );
    }

    const bootstrapWordPress = dependencies.runWordPressCreateProject ?? runWordPressCreateProject;
    await bootstrapWordPress(targetDir);
    return { overwriteTemplateFiles: false };
  }

  if (template === "rails7") {
    if (nonEmpty) {
      if (await looksLikeRailsProject(targetDir, dependencies)) {
        return {
          overwriteTemplateFiles: true,
          templateEntriesToUpdate: ["loom.yaml"],
          templateEntriesToCreateIfMissing: [".env.example"]
        };
      }

      throw new Error(
        `Target directory '${targetDir}' must be empty to initialize '${template}' because Loom bootstraps the Rails project in that directory.`
      );
    }

    const bootstrapRails = dependencies.runRailsCreateProject ?? runRailsCreateProject;
    await bootstrapRails(targetDir);
    return { overwriteTemplateFiles: false };
  }

  if (template === "rails7-hotwire") {
    if (nonEmpty) {
      if (await looksLikeRailsProject(targetDir, dependencies)) {
        return {
          overwriteTemplateFiles: true,
          templateEntriesToUpdate: ["loom.yaml"],
          templateEntriesToCreateIfMissing: [".env.example"]
        };
      }

      throw new Error(
        `Target directory '${targetDir}' must be empty to initialize '${template}' because Loom bootstraps the Rails project in that directory.`
      );
    }

    const bootstrapRailsHotwire = dependencies.runRailsHotwireCreateProject ?? runRailsHotwireCreateProject;
    await bootstrapRailsHotwire(targetDir);
    return { overwriteTemplateFiles: false };
  }

  if (template === "php-symfony") {
    if (nonEmpty) {
      if (await looksLikeSymfonyProject(targetDir, dependencies)) {
        return {
          overwriteTemplateFiles: true,
          templateEntriesToUpdate: ["loom.yaml"],
          templateEntriesToCreateIfMissing: [".env.example"]
        };
      }

      throw new Error(
        `Target directory '${targetDir}' must be empty to initialize '${template}' because Loom bootstraps the Symfony project in that directory.`
      );
    }

    const bootstrapSymfony = dependencies.runSymfonyCreateProject ?? runSymfonyCreateProject;
    await bootstrapSymfony(targetDir);
    return {
      overwriteTemplateFiles: false,
      templateEntriesToUpdate: ["loom.yaml"],
      templateEntriesToCreateIfMissing: [".env.example"]
    };
  }

  if (!force && nonEmpty) {
    throw new Error(`Target directory '${targetDir}' is not empty. Use --force to continue.`);
  }

  return { overwriteTemplateFiles: false };
}