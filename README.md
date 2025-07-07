# Intro

This project is a wrapper for some useful and frequently-used loigc, based on common modules(located in modules dir). It focus on can-run, major implementation should be archived in modules layer.

## How to run

1. Run .ts file directly using `runTsExport` or `runOnTsNode`, in vscode's Debug mode or terminal.
2. Run by an excuteable file(bin command) using commander format params.
3. Run in a child process as a background service managed by daemon logic

## Folder Structure

1. Each feature can have it's directory if the logic is complex, say tcp-gateway, and can expose interface for bin command and daemon if needed.
2. For the logic need to expose by command, there should be a file with the same name as bin command to archive detail logic, the bin command in bin dir is just a commander wrapper.
3. For the logic to as background service managed by daemon, there should be a daemon script in daemon dir.

.
├── README.md
├── bin
│   ├── 0-generate-bin.ts
│   ├── daemon.ts
│   ├── nb.ts
│   ├── runOnTsNode.ts
│   ├── runTsExport.ts
│   ├── tcp-gateway.ts
│   └── ...
├── src
│   ├── command
│   │   ├── http-server.ts
│   │   ├── nb
│   │   ├── runTsExport.ts
│   │   ├── tcp-gateway.test.ts
│   │   └── tcp-gateway.ts
│   ├── daemon
│   ├── redis
│   ├── service
│   ├── tcp-gateway
│   └── types
├── modules
│   └── lib
│       ├── db
│       ├── fe
│       ├── net
│       ├── node
│       └── utils
├── node_modules
│   ├── commander -> .pnpm/registry.npmmirror.com+commander@11.1.0/node_modules/commander
│   └── ...
└── tsconfig.json

# About bin command

## Some Rules For Running On ts-node

ts-node can't run .ts file without tsconfig.json found for the file(but can run .js file directly)

For some cases, some params, say `-r ${projectPath}/node_modules/tsconfig-paths/register.js`, `--project ${projectPath}tsconfig.json`, are needed for ts-node runtime, so if we want run a .ts file as bin command, we need provide these params to ts-node runtime in shebang line. The thing is these ts-node params depends on the location of this project, so they should be generated dynamically as this project may be run on different platform.

The shebang line for bin command is not support very well in every platform, e.g. Centos not support pass param in shebang line.

## Change log

1. Actual command logic is located in src/command file, bin/command is just a script to spawn it's related file in src/command, it will append accurate param for command script. @deprecated as it will start more threads.

1. Use the shell script as shebang line for .ts bin command, for more compatible.

## Generation of bin command

run ./bin/0-generate-bin.ts target-bin-dir

0-generate-bin.ts will link an existing command to link file in `target-bin-dir`

append `target-bin-dir` to global env PATH

## Use runTsExport as command for vscode debug

For the case of vscode `can not found path of runtimeExecutable on launch.json`:
Append `alias runTsExport='${HOME}/code/bin/runTsExport'` to `.zshrc`, start vscode from the project dirctory by running command `code .`.

## How to run on production env

1. Some command should run by root user,
2. set NODE_ENV=elif by command `export NODE_ENV=elif` on terminal

**Start by forever on server**

forever start /share/nvm/versions/node/v18.18.0/bin/ts-node -r /share/code/node/start/busybox/node_modules/tsconfig-paths/register.js --project /share/code/node/start/busybox/tsconfig.json --transpileOnly /share/code/node/start/busybox/src/command/http-server.ts -p 80

## Takeaways

**Dir bin, src/command**

For command `runTsExport`, two node process will be created for one bin command, it will cost may resource. You can run `runTsExport -d` first and run the command output again as second step.

## Notice

**About --swc of runTsExport**

--swc can speed up logic of runTsExport from 5s to 2s, but should install depended packages: `npm install -g @swc/core @swc/helpers`
