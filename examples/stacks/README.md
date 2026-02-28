# Additional stack templates

Use these with `loom init <template>`:

- `dotnet` (alias: `stack-dotnet`)
- `rails7` (alias: `stack-rails7`)
- `jamstack` (alias: `stack-jamstack`)
- `serverless` (alias: `stack-serverless`)
- `spring-react` (alias: `stack-spring-react`)

## Quickstart: .NET

```bash
loom init dotnet --dir my-dotnet
cd my-dotnet
loom start
loom status
loom stop
```

## Quickstart: Rails 7

```bash
loom init rails7 --dir my-rails7
cd my-rails7
loom start
loom status
loom stop
```

## Quickstart: JAMstack

```bash
loom init jamstack --dir my-jamstack
cd my-jamstack
loom start
loom status
loom stop
```

## Quickstart: Serverless

```bash
loom init serverless --dir my-serverless
cd my-serverless
loom start
loom status
loom stop
```

## Quickstart: Spring + React

```bash
loom init spring-react --dir my-spring-react
cd my-spring-react
loom start
loom status
loom stop
```

Smoke test all stack templates:

```bash
pnpm smoke:stacks
```
