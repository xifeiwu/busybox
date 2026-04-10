# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A TypeScript CLI toolkit ("busybox") that bundles frequently-used development utilities as executable commands. Built on shared library modules (git submodules in `modules/`), it focuses on runnable commands while keeping core logic in the modules layer.

## Build & Development Commands

```bash
# Type-check without emitting
npm run ts-check          # tsc --noEmit

# Compile TypeScript to dist/ (resolves path aliases)
npm run build             # tsc && npx tsc-alias

# Full pipeline: compile + generate bin wrappers + link to $PATH
./bin/generate-bin all

# Just relink existing bins to $PATH
./bin/generate-bin link
```

Tests exist as `.test.ts` files alongside source but there is no configured test runner. Run individual tests directly with `ts-node`.

## Execution Modes

Commands can run in two ways:
- **Development**: `ts-node` executes `.ts` bin files directly (slower startup, compiles on the fly)
- **Production**: Compiled `.js` in `dist/` via `npm run build` (faster startup, no TS overhead)

## Architecture

### Command Registration

All commands are registered in `src/0-generate-bin/config.ts` via the `BIN_TO_COMMAND` map. Each entry maps a bin name to a source file path and optional runtime/link config. The build system (`src/0-generate-bin/1-link-bin.ts`) generates wrapper scripts in `bin/` and symlinks them to `~/.code/bin`.

### Source Layout

- **`src/0-generate-bin/`** - Build system: compiles TS, generates bin wrappers, links to $PATH
- **`src/1-command/`** - CLI command implementations using `commander`
- **`src/daemon/`** - Daemon feature: manage child processes (start, stop, restart background services)
- **`src/2-daemon-scripts/`** - Scripts run as child processes by daemon, and their spawn configs
- **`src/service/external.ts`** - Re-exports from modules (avoid importing this file directly as it loads everything)
- **`modules/`** - Git submodules with shared libraries (js, node, net, db, utils, types)

### Key Commands

| Bin name | Source | Purpose |
|----------|--------|---------|
| `nb` | `src/1-command/node-busybox/index` | Main dispatcher with subcommands (file, net, process) |
| `runTsExport` | `src/1-command/run-ts-export` | Execute specific exported functions from TS files |
| `runTsScript` | `src/1-command/run-ts-script` | Run entire TS scripts |
| `ap` | `src/1-command/assist-prettier` | Prettier formatting automation |
| `db` | `src/db/command` | Database CLI (sequelize/sqlite3/mysql2) |
| `subrepo` | `src/1-command/subrepo` | Git submodule management (ts-node only) |

### Adding a New Command

1. Create the command file in `src/1-command/` using `commander` for CLI parsing
2. Register it in `src/0-generate-bin/config.ts` (`BIN_TO_COMMAND` map)
3. Run `./bin/generate-bin link` to generate the bin wrapper and symlink

## Code Conventions

- Path aliases: `@modules/*` → `modules/*`, `@src/*` → `src/*` (resolved by `tsc-alias` at build)
- **In command files (`src/1-command/`), use relative paths instead of `@modules`/`@src` aliases**, because bin wrappers run via ts-node without tsconfig path resolution, and `@modules` imports will fail at runtime
- **Import from the most specific file path possible** (e.g. `../../modules/lib/node/http/server/server` instead of `../../modules/lib/node/http/server`) to avoid loading unnecessary modules at runtime
- Prettier: single quotes, no bracket spacing, trailing commas (es5), 110 char width, LF line endings
- Avoid importing from `src/service/external.ts` directly — it eagerly loads all re-exported modules
- Features are organized by folder under `src/`, exposing files as: `bin.ts`, `command.ts`, or `script.ts` (child process scripts)
