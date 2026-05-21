# Assets management CLI

Application layer for the `assets` command. Depends on:

- `modules/lib/node/lib/assets-management` — core library (diff, operations, tcp-protocol)
- `modules/lib/db` — database-backed meta source

## Layout

```
src/assets-management/
├── cli.ts           # Commander entry (bin: assets)
├── external.ts      # Re-exports from lib + shared node utilities
├── meta-source/     # Multi meta source registry
└── command/         # Subcommand handlers
```

## Meta source files

Place files under `{assetsDir}/.meta/` with this naming pattern:

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

If no matching files exist, uses `.meta/index.ts` when present, otherwise the legacy default local meta path.
