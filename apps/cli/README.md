# @loomdev/cli

Command-line interface for Loom.

- `loom init`, `start`, `stop`, `ps`, `status`
- `logs`, `exec`, `test`, `backup`
- `loom init` accepts an explicit template or prompts for one when no template is provided, with a suggested default when Loom recognizes common root files.

## Install Globally

Install globally so the loom command is available in your shell PATH.

```bash
npm install -g @loomdev/cli
```

If you run npm install @loomdev/cli without -g, use npx loom instead of loom.

## Quick Start

```bash
loom init node --dir my-app
cd my-app
loom start
loom status
```

## Requirements

- Node.js 24+
- Podman

## Help

```bash
loom --help
```
