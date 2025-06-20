# Intro

This is a busybox for frequently used stable tools that can be run as a global bin command.

# About bin command

## Basic thoughts

When run .ts file on ts-node, some params, include `-r ${projectPath}/node_modules/tsconfig-paths/register.js`, `--project ${projectPath}tsconfig.json`, are must to have for ts-node runtime, so if we want run a .ts file as bin command, we must provide these params to ts-node in shebang line.
The thing is these ts-node params depends on the location of this project, so they should be generated dynamically as this project may be cloned to different place of different platform.

Centos not support pass param on shebang line, the solution is add ts-node command in a shell script, and use the shell script as shebang line of .ts bin command.

Commands in `bin` dir is a warpper of logic located on `src/command`, and run files of `src/command` as child process with params found by some logic. The benefit of this way is we can add test case for file in `src/command`, to debug or run actual logic of command.

Command just provide a way of running command logic from terminal, and collect params by user input.

## Generation of bin command

run ./bin/0-generate-bin.ts target-bin-dir

0-generate-bin.ts will link an existing command to link file in `target-bin-dir`

append `target-bin-dir` to global env PATH

## How to run command logic

1. After run `./bin/0-generate-bin.ts` and append `target-bin-dir` to env PATH, we can run by bin command directly from terminal
2. Run actual logic on `runOnTsNode`, like this: `runOnTsNode src/command/http-server.ts`
3. As actual logic are located in dir `src/command`, we can add test case for function, and run it by command `runTsExport`

## runTsExport as command for vscode debug

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