# Intro

This project is a wrapper of some frequently-used loigc for daily development, based on common modules(located in modules dir). It focus on can-run, major logic should be implemented on modules layer.

Logic can be run in these ways: 
1. as a script start by runtime, like, ts-node src/command/login-to-server.ts
2. as bin file: like, ./src/0-generate-bin/bin.ts, or exposed to shell $PATH and run by name directly
3. start in a background process, by the logic is implememted in src/1-daemon

Try to avoid import file in this way import {getFileList} from '../service/external.ts';, as it will load all files exported from service/extenal.ts during runtime.

## Folder Structure

1. Features are categotrized by folder under src dir, and can expose three kinds of file: 1. bin file `bin.ts`, 2. command file `command.ts`, 3. script file `script.ts` which will be run as child process. For each kind of file, when there are more files, a folder(bin, command, script) can be created to store them. Small logic can be stored in folder (bin, command, script) of src dir.
2. The logic in dir `0-generate-bin` can compile this project to .js file, create bin file to dir bin from command file, and link them to shell global $PATH
3. The logic in dir `1-daemon` is used to start script in child process and manage them.


.
├── README.md
├── src
│   ├── 0-generate-bin
│   ├── 1-command
│   ├── 2-daemon
│   ├── other
│   ├── redis
│   ├── run-script
│   ├── service
│   ├── tcp-gateway
│   └── types
├── dist
│   ├── bin
│   ├── modules
│   ├── node_modules
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   ├── src
│   └── version.txt
├── bin
│   ├── daemon.js
│   ├── daemon.ts
│   ├── io-transparent.js
│   ├── io-transparent.ts
│   ├── login-to-server.js
│   ├── login-to-server.ts
│   ├── nb.js
│   ├── nb.ts
│   ├── runTsExport.js
│   ├── runTsExport.ts
│   ├── runTsScript.js
│   ├── runTsScript.ts
│   ├── syncup-gitmodules.js
│   ├── syncup-gitmodules.ts
│   ├── tcp-gateway.js
│   └── tcp-gateway.ts
├── modules
│   └── lib
├── node_modules
│   ├── @types
│   ├── commander -> .pnpm/registry.npmmirror.com+commander@11.1.0/node_modules/commander
│   ├── tsc-alias -> .pnpm/tsc-alias@1.8.10/node_modules/tsc-alias
│   └── tsconfig-paths -> .pnpm/registry.npmmirror.com+tsconfig-paths@4.2.0/node_modules/tsconfig-paths
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tsconfig.json


# Thoughts of generate-bin

It will significantly improve efficiency if the frequently-used logic can be run as a bin command in terminal.
If run command as .ts file, ts-node will compile all the related .ts files on every startup, it will take long time before real logic started.
The logic start with a .js bin command is a better solution, in order to go this way, generate-bin will compile the whole project and submodules it used, and create bin command in dir bin, these bin files can be linked to global PAHT by link-bin action.

# About bin command

## Some Rules For Running On ts-node

ts-node can't run .ts file without tsconfig.json found for the file(but can run .js file directly)

For some cases, some params, say `-r ${projectPath}/node_modules/tsconfig-paths/register.js`, `--project ${projectPath}tsconfig.json`, are needed for ts-node runtime, so if we want run a .ts file as bin command, we need provide these params to ts-node runtime in shebang line. The thing is these ts-node params depends on the location of this project, so they should be generated dynamically as this project may be run on different platform.

The shebang line for bin command is not support very well in every platform, e.g. Centos not support pass param in shebang line.

## Change log

1. Actual command logic is located in src/command file, bin/command is just a script to spawn it's related file in src/command, it will append accurate param for command script. @deprecated as it will start more threads.

1. Use the shell script as shebang line for .ts bin command, for more compatible.

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
