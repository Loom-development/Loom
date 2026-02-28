# Additional stack templates

Use these with `loom init <template>`:

- `dotnet` (alias: `stack-dotnet`)
- `rails7` (alias: `stack-rails7`)
- `jamstack` (alias: `stack-jamstack`)
- `serverless` (alias: `stack-serverless`)
- `spring-react` (alias: `stack-spring-react`)

Example:

```bash
loom init spring-react --dir my-spring-react
cd my-spring-react
loom start
```

Smoke test all stack templates:

```bash
pnpm smoke:stacks
```
