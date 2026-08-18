export interface StackDefinition {
  id: string;
  assetPath: string;
  scaffoldVersion: string;
  loomOwnedFiles: readonly string[];
}

const initialOwnedFiles = ["loom.yaml", ".env.example"] as const;

function defineStack(id: string, assetPath: string, scaffoldVersion = "1"): StackDefinition {
  return {
    id,
    assetPath,
    scaffoldVersion,
    loomOwnedFiles: initialOwnedFiles
  };
}

export const stackDefinitions = [
  defineStack("node", "node"),
  defineStack("node-mean", "node/mean"),
  defineStack("node-mern", "node/mern"),
  defineStack("node-t3", "node/t3"),
  defineStack("bun", "bun"),
  defineStack("python", "python"),
  defineStack("python-django", "python/django"),
  defineStack("python-flask", "python/flask"),
  defineStack("python-fastapi", "python/fastapi"),
  defineStack("php", "php"),
  defineStack("php-wordpress", "php/wordpress", "wordpress-6-php8.3-apache"),
  defineStack("php-drupal", "php/drupal", "unversioned"),
  defineStack("php-symfony", "php/symfony", "unversioned"),
  defineStack("db-mysql", "databases/mysql"),
  defineStack("db-sqlserver", "databases/sqlserver"),
  defineStack("db-postgres", "databases/postgres"),
  defineStack("db-mongodb", "databases/mongodb"),
  defineStack("db-redis", "databases/redis"),
  defineStack("db-elasticsearch", "databases/elasticsearch"),
  defineStack("db-sqlite", "databases/sqlite"),
  defineStack("db-mariadb", "databases/mariadb"),
  defineStack("db-all", "databases/all"),
  defineStack("dotnet", "dotnet"),
  defineStack("rails7", "rails7", "rails-7.1.5"),
  defineStack("rails7-hotwire", "rails7-hotwire", "rails-7.1.5-hotwire"),
  defineStack("jamstack", "jamstack"),
  defineStack("serverless", "serverless"),
  defineStack("spring-react", "spring-react"),
  defineStack("spring-boot", "spring-boot"),
  defineStack("astro", "astro"),
  defineStack("django-react", "django-react")
] as const satisfies readonly StackDefinition[];

const stackDefinitionsById = new Map(stackDefinitions.map((definition) => [definition.id, definition]));

export function findStackDefinition(stackId: string): StackDefinition | undefined {
  return stackDefinitionsById.get(stackId);
}

export function listStackIds(): string[] {
  return stackDefinitions.map((definition) => definition.id).sort();
}
