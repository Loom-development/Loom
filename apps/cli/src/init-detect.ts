import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readOptionalFile(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return undefined;
  }
}

function includesAny(content: string, patterns: string[]): boolean {
  return patterns.some((pattern) => content.includes(pattern));
}

export async function detectInitTemplateSuggestion(rootDir: string): Promise<string | undefined> {
  const composerJson = await readOptionalFile(resolve(rootDir, "composer.json"));
  if (composerJson) {
    if (includesAny(composerJson, ["drupal/core-recommended", "drupal/core-composer-scaffold"])) {
      return "php-drupal";
    }

    if (includesAny(composerJson, ["symfony/framework-bundle"])) {
      return "php-symfony";
    }

    if (includesAny(composerJson, ["roots/wordpress", "johnpbloch/wordpress"])) {
      return "php-wordpress";
    }

    return "php";
  }

  const packageJson = await readOptionalFile(resolve(rootDir, "package.json"));
  if (packageJson) {
    if (includesAny(packageJson, ["\"bun\"", "bun.lock", "bunfig.toml"])) {
      return "bun";
    }

    return "node";
  }

  const pyprojectToml = await readOptionalFile(resolve(rootDir, "pyproject.toml"));
  if (pyprojectToml) {
    if (includesAny(pyprojectToml.toLowerCase(), ["django"])) {
      return "python-django";
    }

    if (includesAny(pyprojectToml.toLowerCase(), ["fastapi"])) {
      return "python-fastapi";
    }

    if (includesAny(pyprojectToml.toLowerCase(), ["flask"])) {
      return "python-flask";
    }

    return "python";
  }

  const requirementsTxt = await readOptionalFile(resolve(rootDir, "requirements.txt"));
  if (requirementsTxt) {
    const lowered = requirementsTxt.toLowerCase();
    if (includesAny(lowered, ["django"])) {
      return "python-django";
    }

    if (includesAny(lowered, ["fastapi"])) {
      return "python-fastapi";
    }

    if (includesAny(lowered, ["flask"])) {
      return "python-flask";
    }

    return "python";
  }

  const gemfile = await readOptionalFile(resolve(rootDir, "Gemfile"));
  if (gemfile && includesAny(gemfile.toLowerCase(), ["rails"])) {
    return "rails7";
  }

  try {
    const entries = await readdir(rootDir);
    if (entries.some((entry) => entry.endsWith(".csproj") || entry.endsWith(".sln"))) {
      return "dotnet";
    }
  } catch {
    return undefined;
  }

  if (await pathExists(resolve(rootDir, "bun.lockb"))) {
    return "bun";
  }

  if (await pathExists(resolve(rootDir, "bun.lock"))) {
    return "bun";
  }

  return undefined;
}