# Loom Examples Matrix

| Stack | Config | Domain | App Host Port | Start | Status | Logs | Stop | Notes |
|---|---|---|---:|---|---|---|---|---|
| Node (basic) | `examples/node/loom.yaml` | `node.loom.local` | `3000` | `pnpm --filter @loom/cli dev start --config examples/node/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/node/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/node/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/node/loom.yaml` | Single Node app |
| Bun (runtime) | `examples/node/bun/loom.yaml` | `bun.loom.local` | `3004` | `pnpm --filter @loom/cli dev start --config examples/node/bun/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/node/bun/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/node/bun/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/node/bun/loom.yaml` | Bun runtime app |
| Node MEAN | `examples/node/mean/loom.yaml` | `mean.loom.local` | `4200` | `pnpm --filter @loom/cli dev start --config examples/node/mean/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/node/mean/loom.yaml` | `pnpm --filter @loom/cli dev logs api --config examples/node/mean/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/node/mean/loom.yaml` | Mongo + Express API + AngularJS web |
| Node MERN | `examples/node/mern/loom.yaml` | `mern.loom.local` | `5173` | `pnpm --filter @loom/cli dev start --config examples/node/mern/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/node/mern/loom.yaml` | `pnpm --filter @loom/cli dev logs api --config examples/node/mern/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/node/mern/loom.yaml` | Mongo + Express API + React web |
| Node T3 | `examples/node/t3/loom.yaml` | `t3.loom.local` | `3003` | `pnpm --filter @loom/cli dev start --config examples/node/t3/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/node/t3/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/node/t3/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/node/t3/loom.yaml` | Tailwind + TypeScript + Turborepo + Drizzle + Postgres |
| Python (basic) | `examples/python/loom.yaml` | `python.loom.local` | `8000` | `pnpm --filter @loom/cli dev start --config examples/python/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/python/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/python/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/python/loom.yaml` | Python app + Redis |
| Python Django | `examples/python/django/loom.yaml` | `django.loom.local` | `8001` | `pnpm --filter @loom/cli dev start --config examples/python/django/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/python/django/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/python/django/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/python/django/loom.yaml` | Django app |
| Python Flask | `examples/python/flask/loom.yaml` | `flask.loom.local` | `8002` | `pnpm --filter @loom/cli dev start --config examples/python/flask/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/python/flask/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/python/flask/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/python/flask/loom.yaml` | Flask app |
| Python FastAPI | `examples/python/fastapi/loom.yaml` | `fastapi.loom.local` | `8003` | `pnpm --filter @loom/cli dev start --config examples/python/fastapi/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/python/fastapi/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/python/fastapi/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/python/fastapi/loom.yaml` | FastAPI app |
| .NET stack | `examples/stacks/dotnet/loom.yaml` | `dotnet.loom.local` | `5000` | `pnpm --filter @loom/cli dev start --config examples/stacks/dotnet/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/stacks/dotnet/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/stacks/dotnet/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/stacks/dotnet/loom.yaml` | ASP.NET 8 minimal API |
| Ruby on Rails 7 | `examples/stacks/rails7/loom.yaml` | `rails7.loom.local` | `3006` | `pnpm --filter @loom/cli dev start --config examples/stacks/rails7/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/stacks/rails7/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/stacks/rails7/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/stacks/rails7/loom.yaml` | Bootstraps Rails 7 app on first run |
| JAMstack | `examples/stacks/jamstack/loom.yaml` | `jamstack.loom.local` | `5174` | `pnpm --filter @loom/cli dev start --config examples/stacks/jamstack/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/stacks/jamstack/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/stacks/jamstack/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/stacks/jamstack/loom.yaml` | Vite static front-end |
| Serverless Stack | `examples/stacks/serverless/loom.yaml` | `serverless.loom.local` | `3007` | `pnpm --filter @loom/cli dev start --config examples/stacks/serverless/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/stacks/serverless/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/stacks/serverless/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/stacks/serverless/loom.yaml` | Serverless Framework + Offline plugin |
| Spring Boot + React | `examples/stacks/spring-react/loom.yaml` | `spring-react.loom.local` | `5175` | `pnpm --filter @loom/cli dev start --config examples/stacks/spring-react/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/stacks/spring-react/loom.yaml` | `pnpm --filter @loom/cli dev logs web --config examples/stacks/spring-react/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/stacks/spring-react/loom.yaml` | Maven Spring API + React frontend |
| PHP (basic) | `examples/php/loom.yaml` | `php.loom.local` | `8085` | `pnpm --filter @loom/cli dev start --config examples/php/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/php/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/php/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/php/loom.yaml` | PHP app + Postgres |
| PHP WordPress | `examples/php/wordpress/loom.yaml` | `wordpress.loom.local` | `8090` | `pnpm --filter @loom/cli dev start --config examples/php/wordpress/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/php/wordpress/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/php/wordpress/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/php/wordpress/loom.yaml` | WordPress + MySQL |
| PHP Drupal | `examples/php/drupal/loom.yaml` | `drupal.loom.local` | `8091` | `pnpm --filter @loom/cli dev start --config examples/php/drupal/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/php/drupal/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/php/drupal/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/php/drupal/loom.yaml` | Drupal + MySQL |
| PHP Symfony (prebuilt) | `examples/php/symfony/loom.yaml` | `symfony.loom.local` | `8092` | `pnpm --filter @loom/cli dev start --config examples/php/symfony/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/php/symfony/loom.yaml` | `pnpm --filter @loom/cli dev logs app --config examples/php/symfony/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/php/symfony/loom.yaml` | Prebuilt Symfony-style runtime + Composer auto-install |

## Database templates

| Template | Config | Host Port | Start | Status | Logs | Stop | Notes |
|---|---|---:|---|---|---|---|---|
| db-mysql | `examples/databases/mysql/loom.yaml` | `3306` | `pnpm --filter @loom/cli dev start --config examples/databases/mysql/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/databases/mysql/loom.yaml` | `pnpm --filter @loom/cli dev logs db --config examples/databases/mysql/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/databases/mysql/loom.yaml` | MySQL 8.4 |
| db-sqlserver | `examples/databases/sqlserver/loom.yaml` | `1433` | `pnpm --filter @loom/cli dev start --config examples/databases/sqlserver/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/databases/sqlserver/loom.yaml` | `pnpm --filter @loom/cli dev logs db --config examples/databases/sqlserver/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/databases/sqlserver/loom.yaml` | SQL Server 2022 Developer |
| db-postgres | `examples/databases/postgres/loom.yaml` | `5432` | `pnpm --filter @loom/cli dev start --config examples/databases/postgres/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/databases/postgres/loom.yaml` | `pnpm --filter @loom/cli dev logs db --config examples/databases/postgres/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/databases/postgres/loom.yaml` | PostgreSQL 16 |
| db-mongodb | `examples/databases/mongodb/loom.yaml` | `27017` | `pnpm --filter @loom/cli dev start --config examples/databases/mongodb/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/databases/mongodb/loom.yaml` | `pnpm --filter @loom/cli dev logs db --config examples/databases/mongodb/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/databases/mongodb/loom.yaml` | MongoDB 7 |
| db-redis | `examples/databases/redis/loom.yaml` | `6379` | `pnpm --filter @loom/cli dev start --config examples/databases/redis/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/databases/redis/loom.yaml` | `pnpm --filter @loom/cli dev logs db --config examples/databases/redis/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/databases/redis/loom.yaml` | Redis 7 |
| db-elasticsearch | `examples/databases/elasticsearch/loom.yaml` | `9200` | `pnpm --filter @loom/cli dev start --config examples/databases/elasticsearch/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/databases/elasticsearch/loom.yaml` | `pnpm --filter @loom/cli dev logs db --config examples/databases/elasticsearch/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/databases/elasticsearch/loom.yaml` | Elasticsearch single-node |
| db-sqlite | `examples/databases/sqlite/loom.yaml` | `-` | `pnpm --filter @loom/cli dev start --config examples/databases/sqlite/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/databases/sqlite/loom.yaml` | `pnpm --filter @loom/cli dev logs db --config examples/databases/sqlite/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/databases/sqlite/loom.yaml` | SQLite file at `./data/sqlite/loom.db` in project directory |
| db-mariadb | `examples/databases/mariadb/loom.yaml` | `3307` | `pnpm --filter @loom/cli dev start --config examples/databases/mariadb/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/databases/mariadb/loom.yaml` | `pnpm --filter @loom/cli dev logs db --config examples/databases/mariadb/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/databases/mariadb/loom.yaml` | MariaDB 11 |
| db-all | `examples/databases/all/loom.yaml` | `3306, 1433, 5432, 27017, 6379, 9200, 9300, 3307` | `pnpm --filter @loom/cli dev start --config examples/databases/all/loom.yaml` | `pnpm --filter @loom/cli dev status --config examples/databases/all/loom.yaml` | `pnpm --filter @loom/cli dev logs postgres --config examples/databases/all/loom.yaml --no-follow` | `pnpm --filter @loom/cli dev stop --config examples/databases/all/loom.yaml` | All supported databases in one stack |

## Shared runtime behavior

- `loom start` provisions project network + reverse proxy.
- HTTPS routes are proxied via local certs under each example’s `.loom/certs`.
- Rootless-friendly proxy ports: `8080` (HTTP), `8443` (HTTPS).
- `loom stop` tears down service containers and route proxy for that project.

## First run checklist

1. Verify Podman is available:

	`podman version`

2. Install workspace dependencies:

	`pnpm install`

3. Start one example stack (replace with any config from the table):

	`pnpm --filter @loom/cli dev start --config examples/node/t3/loom.yaml`

4. Confirm running services:

	`pnpm --filter @loom/cli dev ps --config examples/node/t3/loom.yaml`

5. Stop when done:

	`pnpm --filter @loom/cli dev stop --config examples/node/t3/loom.yaml`

## Troubleshooting

- Podman not available:

	`podman version`

- Podman Machine not running (macOS/Windows):

	`podman machine start`

- Example stuck on readiness:

	`pnpm --filter @loom/cli dev logs app --config <path-to-loom.yaml> --no-follow`

- Verify container state quickly:

	`pnpm --filter @loom/cli dev ps --config <path-to-loom.yaml>`

- Clean restart for one stack:

	`pnpm --filter @loom/cli dev stop --config <path-to-loom.yaml> && pnpm --filter @loom/cli dev start --config <path-to-loom.yaml>`
