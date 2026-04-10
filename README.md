# Busybox

A TypeScript CLI toolkit that wraps frequently-used logic for daily development, based on common modules (located in `modules/` dir). It focuses on being runnable — major logic should be implemented at the modules layer.


## Execution Modes

Logic can be run in three ways:

1. As a script started by runtime: `ts-node src/command/login-to-server.ts`
2. As a bin file: `./src/0-generate-bin/bin.ts`, or exposed to shell `$PATH` and run by name directly
3. As a background process, managed by `src/daemon`

> **Note:** Avoid importing from `src/service/external.ts` directly (e.g. `import {getFileList} from '../service/external.ts'`), as it will eagerly load all exported modules at runtime.

## Folder Structure

Features are categorized by folder under `src/`, and can expose two kinds of file:
- `command.ts` — command file
- `daemon-script.ts` — script run as child process

When there are multiple files of the same kind, a subfolder (`bin/`, `command/`, `script/`) can be created to store them.

For simple command or daemon-script, it's unnecessary to create a new folder to locate them, it can be placed into dir `1-command`/`2-daemon-scripts` directly.

```
.
├── src
│   ├── 0-generate-bin    # Compile project, create bin files, link to $PATH
│   ├── 1-command         # Command implementations
│   ├── 2-daemon-scripts          # Scripts run as child processes by daemon
│   ├── daemon              # Daemon feature: manage child processes
│   ├── db                # Database commands
│   ├── redis             # Redis integration
│   ├── service           # Shared services
│   ├── tcp-gateway       # TCP gateway server
│   └── types             # Type definitions
├── bin                   # Generated executable wrappers (.ts and .js)
├── dist                  # Compiled JavaScript output
├── modules               # Git submodules (shared libraries)
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

## Generate-bin

Running frequently-used logic as a bin command in the terminal significantly improves efficiency. Running commands as `.ts` files means ts-node compiles all related files on every startup, which is slow. Compiled `.js` bin commands are a better solution.

`generate-bin` compiles the whole project and its submodules, creates bin files in the `bin/` directory, and links them to the global `$PATH` via `link-bin`.

## Bin Command

### ts-node Rules

- ts-node cannot run `.ts` files without a `tsconfig.json` found for the file (but can run `.js` files directly).
- Some params are needed for ts-node runtime: `-r ${projectPath}/node_modules/tsconfig-paths/register.js` and `--project ${projectPath}/tsconfig.json`. These depend on the project location, so they are generated dynamically.
- Shebang lines are not well supported on every platform (e.g. CentOS does not support passing params in shebang lines).

### VSCode Debug with runTsExport

If VSCode reports "cannot find path of runtimeExecutable on launch.json":

Append `alias runTsExport='${HOME}/code/bin/runTsExport'` to `.zshrc`, then start VSCode from the project directory with `code .`.

### Production Environment

1. Some commands require root: `sudo su root`
2. Set environment: `export NODE_ENV=elif`
3. Run in detached mode: `daemon start-detach`

**Start with forever on server:**

```bash
forever start /share/nvm/versions/node/v18.18.0/bin/ts-node \
  -r /share/code/node/start/busybox/node_modules/tsconfig-paths/register.js \
  --project /share/code/node/start/busybox/tsconfig.json \
  --transpileOnly \
  /share/code/node/start/busybox/src/command/http-server.ts -p 80
```

### runTsExport Tips

- Running `runTsExport` creates two Node processes per bin command, which costs more resources. You can run `runTsExport -d` first and then run the output command as a second step.
- `--swc` speeds up runTsExport from ~5s to ~2s, but requires: `npm install -g @swc/core @swc/helpers`
