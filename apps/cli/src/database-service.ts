import type { DbType } from "./init-prompt.js";
import { findStackDefinition } from "./stacks.js";

export interface DatabaseServiceBlock {
  serviceName: string;
  serviceYaml: string;
  envVars: Record<string, string>;
}

const imageMetadata: Record<DbType, { stackId: string; env: string }> = {
  postgres: { stackId: "db-postgres", env: "POSTGRES_IMAGE" },
  mysql: { stackId: "db-mysql", env: "MYSQL_IMAGE" },
  mariadb: { stackId: "db-mariadb", env: "MARIADB_IMAGE" },
  mongodb: { stackId: "db-mongodb", env: "MONGO_IMAGE" },
  redis: { stackId: "db-redis", env: "REDIS_IMAGE" }
};

function databaseImage(db: DbType): { env: string; reference: string } {
  const metadata = imageMetadata[db];
  const definition = findStackDefinition(metadata.stackId);
  const image = definition?.runtimeImages.find(({ env }) => env === metadata.env);
  if (!image) throw new Error(`Missing canonical ${metadata.env} pin for '${metadata.stackId}'`);
  return image;
}

export function buildDatabaseServiceBlock(db: DbType): DatabaseServiceBlock {
  const image = databaseImage(db);
  switch (db) {
    case "postgres":
      return {
        serviceName: "postgres",
        serviceYaml: [
          "  postgres:",
          "    type: postgres",
          `    image: \${POSTGRES_IMAGE:-${image.reference}}`,
          "    env:",
          "      POSTGRES_USER: app",
          "      POSTGRES_PASSWORD: app",
          "      POSTGRES_DB: app",
          "    ports:",
          '      - "5432:5432"',
          "    volumes:",
          "      - ./data/postgres:/var/lib/postgresql/data",
          "    healthcheck:",
          "      command: pg_isready -U app",
          "      intervalSeconds: 3",
          "      timeoutSeconds: 3",
          "      retries: 30",
          "      startPeriodSeconds: 5"
        ].join("\n"),
        envVars: {
          [image.env]: image.reference,
          POSTGRES_USER: "app",
          POSTGRES_PASSWORD: "app",
          POSTGRES_DB: "app",
          DATABASE_URL: "postgresql://app:app@postgres:5432/app"
        }
      };
    case "mysql":
      return {
        serviceName: "mysql",
        serviceYaml: [
          "  mysql:",
          "    type: mysql",
          `    image: \${MYSQL_IMAGE:-${image.reference}}`,
          "    env:",
          "      MYSQL_ROOT_PASSWORD: root",
          "      MYSQL_DATABASE: app",
          "      MYSQL_USER: app",
          "      MYSQL_PASSWORD: app",
          "    ports:",
          '      - "3306:3306"',
          "    volumes:",
          "      - ./data/mysql:/var/lib/mysql",
          "    healthcheck:",
          "      command: mysqladmin ping -h 127.0.0.1 -proot",
          "      intervalSeconds: 3",
          "      timeoutSeconds: 3",
          "      retries: 30",
          "      startPeriodSeconds: 10"
        ].join("\n"),
        envVars: {
          [image.env]: image.reference,
          MYSQL_ROOT_PASSWORD: "root",
          MYSQL_DATABASE: "app",
          MYSQL_USER: "app",
          MYSQL_PASSWORD: "app",
          MYSQL_URL: "mysql://app:app@mysql:3306/app"
        }
      };
    case "mariadb":
      return {
        serviceName: "mariadb",
        serviceYaml: [
          "  mariadb:",
          "    type: mariadb",
          `    image: \${MARIADB_IMAGE:-${image.reference}}`,
          "    env:",
          "      MARIADB_ROOT_PASSWORD: root",
          "      MARIADB_DATABASE: app",
          "      MARIADB_USER: app",
          "      MARIADB_PASSWORD: app",
          "    ports:",
          '      - "3307:3306"',
          "    volumes:",
          "      - ./data/mariadb:/var/lib/mysql",
          "    healthcheck:",
          "      command: mariadb-admin ping -h 127.0.0.1 -uroot -proot",
          "      intervalSeconds: 3",
          "      timeoutSeconds: 3",
          "      retries: 30",
          "      startPeriodSeconds: 10"
        ].join("\n"),
        envVars: {
          [image.env]: image.reference,
          MARIADB_ROOT_PASSWORD: "root",
          MARIADB_DATABASE: "app",
          MARIADB_USER: "app",
          MARIADB_PASSWORD: "app",
          MARIADB_URL: "mysql://app:app@mariadb:3306/app"
        }
      };
    case "mongodb":
      return {
        serviceName: "mongodb",
        serviceYaml: [
          "  mongodb:",
          "    type: mongodb",
          `    image: \${MONGO_IMAGE:-${image.reference}}`,
          "    env:",
          "      MONGO_INITDB_ROOT_USERNAME: app",
          "      MONGO_INITDB_ROOT_PASSWORD: app",
          "      MONGO_INITDB_DATABASE: app",
          "    ports:",
          '      - "27017:27017"',
          "    volumes:",
          "      - ./data/mongodb:/data/db"
        ].join("\n"),
        envVars: {
          [image.env]: image.reference,
          MONGO_INITDB_ROOT_USERNAME: "app",
          MONGO_INITDB_ROOT_PASSWORD: "app",
          MONGO_INITDB_DATABASE: "app",
          MONGODB_URL: "mongodb://app:app@mongodb:27017/app?authSource=admin"
        }
      };
    case "redis":
      return {
        serviceName: "redis",
        serviceYaml: [
          "  redis:",
          "    type: redis",
          `    image: \${REDIS_IMAGE:-${image.reference}}`,
          "    command: redis-server --appendonly yes",
          "    ports:",
          '      - "6379:6379"',
          "    volumes:",
          "      - ./data/redis:/data",
          "    healthcheck:",
          "      command: redis-cli ping | grep PONG",
          "      intervalSeconds: 3",
          "      timeoutSeconds: 3",
          "      retries: 30",
          "      startPeriodSeconds: 2"
        ].join("\n"),
        envVars: {
          [image.env]: image.reference,
          REDIS_URL: "redis://redis:6379"
        }
      };
  }
}
