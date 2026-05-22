# Assets management CLI

Application layer for the `assets` command. Depends on:

- `modules/lib/node/lib/assets-management` — core library (diff, operations, tcp-protocol)
- `modules/lib/db` — database-backed meta source

## Layout

```
src/assets-management/
├── command.ts           # Commander entry (bin: assets)
├── external.ts          # Re-exports from lib + shared node utilities
├── meta-source/         # Root discovery, registry, init, sync target parsing
│   ├── find-assets-root.ts
│   ├── cli-context.ts
│   ├── sync-target.ts
│   ├── init-meta.ts
│   └── ...
└── commands/            # Subcommand handlers
```

## Assets root (`-d`)

All commands accept a global option:

```bash
assets -d /path/to/assets <subcommand> ...
```

If `-d` is omitted, the CLI walks **upward** from the current working directory until it finds a directory containing `.meta/`. That directory is the assets root. The resolved path is printed at the start of each command:

```
rootDir: /path/to/project/assets
```

## Init

Create `.meta/` and a default local meta source from files on disk:

```bash
assets init                  # use cwd as assets root
assets -d ./my-assets init   # explicit root (no .meta required yet)
assets init --force          # overwrite existing local_primary.ts
```

Writes `.meta/local_primary.ts` in the standard local format (`priority` + `meta` tree with sha1).

## Meta source files

Place files under `{rootDir}/.meta/` with this naming pattern:

```
{type}_{description}.{js|ts}
```

`type` must be one of: `local`, `sqlite`, `mysql`.

Any file may export optional `priority` (number, default `0`). **Higher priority wins** as the primary meta source.

### `local_*` — file is the meta store

```ts
// .meta/local_primary.ts
export const priority = 100;

export const meta = {
  relativePath: '.',
  children: [],
};
```

### `sqlite_*` / `mysql_*` — Sequelize config

```js
// .meta/sqlite_asset.js
module.exports = {
  priority: 50,
  config: {
    dialect: 'sqlite',
    storage: '/path/to/asset.db',
  },
};
```

`config.dialect` must match the filename prefix (`sqlite` or `mysql`).

Registry key is the **filename without extension** (e.g. `local_primary.ts` → `--meta local_primary`).

### Fallback

If no matching files exist under `.meta/`, uses `.meta/index.ts` when present, otherwise the legacy default local meta path (`local.js`).

## Push / pull targets

```bash
assets push ./backup-dir          # local directory
assets pull 192.168.1.10:9090     # remote host:port
assets push                       # default remote 127.0.0.1:80
```

Remote host and port are expressed only via the `[target]` argument (`host` or `host:port`), not separate `-H` / `-p` flags.

## Examples

```bash
assets diff
assets -d . add ./photo.jpg --to photos/2024/01.jpg
assets copy a/10.txt a/15.txt
assets move b/10.txt b/15.txt
assets meta-syncup -y
assets push backup-host:8080
```
