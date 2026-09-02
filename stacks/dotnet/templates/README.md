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
  - Runtime: `${DOTNET_IMAGE:-ghcr.io/loom-development/loom-dotnet-8@sha256:9dc76e1a67889eb32b9fab8b4665bc40cbb497fe2abe704d83fd7c5cc9ee53ec}`
  - Port: `5000`
  - Purpose: .NET development server

## Route

- App: `https://dotnet.loom.local`

## Image overrides

- `DOTNET_IMAGE`

## File permissions

This template keeps the simpler `userns: keep-id` startup model because `dotnet restore` and `dotnet run` do not require privileged package installation during startup, but `loom exec` and task runs now use a host-aligned UID:GID by default through `execUser`.
