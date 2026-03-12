import { createInterface } from "node:readline/promises";
import type { Readable, Writable } from "node:stream";

export const initTemplateChoices = [
  "node",
  "node-mean",
  "node-mern",
  "node-t3",
  "node-bun",
  "python",
  "python-django",
  "python-flask",
  "python-fastapi",
  "php",
  "php-wordpress",
  "php-drupal",
  "php-symfony",
  "db-mysql",
  "db-sqlserver",
  "db-postgres",
  "db-mongodb",
  "db-redis",
  "db-elasticsearch",
  "db-sqlite",
  "db-mariadb",
  "db-all",
  "dotnet",
  "rails7",
  "rails7-hotwire",
  "jamstack",
  "serverless",
  "spring-react",
  "django-react"
] as const;

export const initTemplateDescriptions: Record<(typeof initTemplateChoices)[number], string> = {
  node: "Node.js runtime starter app.",
  "node-mean": "MongoDB, Express.js, Angular, and Node.js.",
  "node-mern": "MongoDB, Express.js API, React frontend, and Node.js runtime.",
  "node-t3": "Next.js, TypeScript, and a Node.js runtime.",
  "node-bun": "Bun runtime starter app.",
  python: "Python runtime starter app.",
  "python-django": "Django web app on Python.",
  "python-flask": "Flask web app on Python.",
  "python-fastapi": "FastAPI service on Python.",
  php: "Plain PHP app served by FrankenPHP.",
  "php-wordpress": "WordPress with PHP and MySQL.",
  "php-drupal": "Drupal with PHP and MySQL.",
  "php-symfony": "Symfony app served by FrankenPHP.",
  "db-mysql": "MySQL database only.",
  "db-sqlserver": "SQL Server database only.",
  "db-postgres": "PostgreSQL database only.",
  "db-mongodb": "MongoDB database only.",
  "db-redis": "Redis database only.",
  "db-elasticsearch": "Elasticsearch service only.",
  "db-sqlite": "SQLite starter app and local file database.",
  "db-mariadb": "MariaDB database only.",
  "db-all": "PostgreSQL, MySQL, MariaDB, MongoDB, Redis, SQLite, SQL Server, and Elasticsearch.",
  dotnet: ".NET starter app.",
  rails7: "Rails 7 app bootstrapped into the project and run on a Ruby base image.",
  "rails7-hotwire": "Rails 7 with Hotwire bootstrapped into the project and run on a Ruby base image.",
  jamstack: "JavaScript, APIs, Markup with a static-first frontend and Node.js API.",
  serverless: "Static frontend plus Node.js FaaS-style HTTP functions and webhooks.",
  "spring-react": "Spring Boot backend and React frontend with a local /api proxy.",
  "django-react": "Django backend and React frontend."
};

export interface InitImageChoice {
  envKey: string;
  label: string;
  options: string[];
}

export const initImageChoicesByTemplate: Record<string, InitImageChoice[]> = {
  node: [{ envKey: "NODE_IMAGE", label: "Node runtime", options: ["node:22-alpine", "node:24-alpine"] }],
  "node-mean": [
    { envKey: "NODE_IMAGE", label: "Node runtime", options: ["node:22-alpine", "node:24-alpine"] }
  ],
  "node-mern": [
    { envKey: "NODE_IMAGE", label: "Node runtime", options: ["node:22-alpine", "node:24-alpine"] }
  ],
  "node-t3": [{ envKey: "NODE_IMAGE", label: "Node runtime", options: ["node:22-alpine", "node:24-alpine"] }],
  jamstack: [{ envKey: "NODE_IMAGE", label: "Node runtime", options: ["node:22-alpine", "node:24-alpine"] }],
  serverless: [{ envKey: "NODE_IMAGE", label: "Node runtime", options: ["node:22-alpine", "node:24-alpine"] }],
  "spring-react": [
    { envKey: "JAVA_IMAGE", label: "Java runtime", options: ["maven:3.9-eclipse-temurin-17", "maven:3.9-eclipse-temurin-21"] },
    { envKey: "NODE_IMAGE", label: "Node runtime", options: ["node:22-alpine", "node:24-alpine"] }
  ],
  "django-react": [
    { envKey: "PYTHON_IMAGE", label: "Python runtime", options: ["python:3.12-slim", "python:3.13-slim"] },
    { envKey: "NODE_IMAGE", label: "Node runtime", options: ["node:22-alpine", "node:24-alpine"] }
  ],
  "node-bun": [{ envKey: "BUN_IMAGE", label: "Bun runtime", options: ["docker.io/oven/bun:1.1", "docker.io/oven/bun:1.2"] }],
  python: [{ envKey: "PYTHON_IMAGE", label: "Python runtime", options: ["python:3.12-slim", "python:3.13-slim"] }],
  "python-django": [{ envKey: "PYTHON_IMAGE", label: "Python runtime", options: ["python:3.12-slim", "python:3.13-slim"] }],
  "python-flask": [{ envKey: "PYTHON_IMAGE", label: "Python runtime", options: ["python:3.12-slim", "python:3.13-slim"] }],
  "python-fastapi": [{ envKey: "PYTHON_IMAGE", label: "Python runtime", options: ["python:3.12-slim", "python:3.13-slim"] }],
  php: [{ envKey: "PHP_IMAGE", label: "PHP runtime", options: ["dunglas/frankenphp:1-php8.3", "dunglas/frankenphp:1-php8.4"] }],
  "php-drupal": [{ envKey: "PHP_IMAGE", label: "PHP runtime", options: ["dunglas/frankenphp:1-php8.3", "dunglas/frankenphp:1-php8.4"] }],
  "php-symfony": [{ envKey: "PHP_IMAGE", label: "PHP runtime", options: ["dunglas/frankenphp:1-php8.3", "dunglas/frankenphp:1-php8.4"] }],
  "php-wordpress": [{ envKey: "PHP_IMAGE", label: "PHP runtime", options: ["php:8.3-apache", "php:8.4-apache"] }],
  rails7: [{ envKey: "RUBY_IMAGE", label: "Ruby base image", options: ["ruby:3.3", "ruby:3.4"] }],
  "rails7-hotwire": [{ envKey: "RUBY_IMAGE", label: "Ruby base image", options: ["ruby:3.3", "ruby:3.4"] }],
  dotnet: [{ envKey: "DOTNET_IMAGE", label: ".NET runtime", options: ["mcr.microsoft.com/dotnet/sdk:8.0", "mcr.microsoft.com/dotnet/sdk:10.0"] }]
};

export async function chooseInitTemplate(
  suggestedTemplate?: string,
  input: Readable = process.stdin,
  output: Writable = process.stdout
): Promise<string> {
  output.write("Choose a template to initialize:\n");
  initTemplateChoices.forEach((template, index) => {
    output.write(`${index + 1}. ${template} - ${initTemplateDescriptions[template]}\n`);
  });

  if (suggestedTemplate) {
    output.write(`Suggested template: ${suggestedTemplate}\n`);
  }

  const rl = createInterface({ input, output });

  try {
    const prompt = suggestedTemplate
      ? `Template number or name [default: ${suggestedTemplate}]: `
      : "Template number or name: ";
    const answer = (await rl.question(prompt)).trim();

    if (!answer && suggestedTemplate) {
      return suggestedTemplate;
    }

    const selectedIndex = Number.parseInt(answer, 10);

    if (Number.isInteger(selectedIndex) && selectedIndex >= 1 && selectedIndex <= initTemplateChoices.length) {
      return initTemplateChoices[selectedIndex - 1];
    }

    if (initTemplateChoices.includes(answer as (typeof initTemplateChoices)[number])) {
      return answer;
    }

    throw new Error(
      `Unknown template selection '${answer}'. Choose a number from 1 to ${initTemplateChoices.length} or a valid template name.`
    );
  } finally {
    rl.close();
  }
}

export function describeInitTemplate(template: string): string {
  return initTemplateDescriptions[template as (typeof initTemplateChoices)[number]] ?? "Loom project template.";
}

export async function chooseInitImageOverrides(
  template: string,
  currentValues: Record<string, string>,
  input: Readable = process.stdin,
  output: Writable = process.stdout
): Promise<Record<string, string>> {
  const imageChoices = initImageChoicesByTemplate[template] ?? [];
  if (imageChoices.length === 0) {
    return {};
  }

  const rl = createInterface({ input, output });

  try {
    const selected: Record<string, string> = {};

    for (const choice of imageChoices) {
      const currentValue = currentValues[choice.envKey] ?? choice.options[0];
      output.write(`Choose ${choice.label} for '${template}':\n`);
      choice.options.forEach((option, index) => {
        output.write(`${index + 1}. ${option}\n`);
      });

      const answer = (await rl.question(`${choice.label} [default: ${currentValue}]: `)).trim();
      if (!answer) {
        selected[choice.envKey] = currentValue;
        continue;
      }

      const selectedIndex = Number.parseInt(answer, 10);
      if (Number.isInteger(selectedIndex) && selectedIndex >= 1 && selectedIndex <= choice.options.length) {
        selected[choice.envKey] = choice.options[selectedIndex - 1];
        continue;
      }

      if (choice.options.includes(answer)) {
        selected[choice.envKey] = answer;
        continue;
      }

      throw new Error(
        `Unknown ${choice.label} selection '${answer}'. Choose a number from 1 to ${choice.options.length} or a listed image tag.`
      );
    }

    return selected;
  } finally {
    rl.close();
  }
}