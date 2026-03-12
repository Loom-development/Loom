# .NET Template

This template gives you a small .NET application served from local project files.

## Quickstart

```bash
loom init dotnet --dir my-dotnet
cd my-dotnet
loom start
loom status
```

## Services

- `app`
  - Runtime: `${DOTNET_IMAGE:-mcr.microsoft.com/dotnet/sdk:8.0}`
  - Port: `5000`
  - Purpose: .NET development server

## Route

- App: `https://dotnet.loom.local`

## Image overrides

- `DOTNET_IMAGE`