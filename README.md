## Intro

This is a busybox for frequently used stable tools that can be run as a global bin command.

## How run bin command

When run .ts file on ts-node, some params, include `-r ${projectPath}/node_modules/tsconfig-paths/register.js`, `--project ${projectPath}tsconfig.json`, are must be provided to ts-node, so if we want run a .ts file as bin command, we must provide these params to ts-node in shebang line.
The thing is these ts-node params depends on the location of this project, so they should be generated dynamically as this project may be cloned to different place of different platform.
Centos not support pass param on shebang line, the solution is add ts-node command in a shell script, and use the shell script as shebang line of .ts bin command.

Commander in `bin` dir is a warpper of logic on `src/commander`, and run files of `src/commander` as child process with params found by some logic.


## How to generate bin command

run ./bin/0-generate-bin.ts target-bin-dir

0-generate-bin.ts will create or link an existing command

append target-bin-dir to global env PATH

**run on child process by spawn**

****

## The way of run commander

**Run commander directly**

run ./bin/link-bin.ts, to dir code/bin, and add it to env PATH, then the commander can be run directly, such as `runOnTsNode`, `daemon`.

**Run commander code**

When `Run commander directly`, two node process will be created, and it will cost more resource.

To avoid resource cost, you can run:

`runOnTsNode src/commander/http-server.ts`

`runOnTsNode ...path` to get the real command, and then run the real command on terminal

**Run on Elif**

When run tcp-gateway, you should set NODE_ENV=elif by command `export NODE_ENV=elif` on terminal

**Use command runTsExport in vscoce**

For the case of vscode `can not found path of runtimeExecutable on launch.json`:

Append `alias runTsExport='${HOME}/code/bin/runTsExport'` to `.zshrc`, start vscode from the project dirctory by running command `code .`.

**Start by forever on server**

forever start /share/nvm/versions/node/v18.18.0/bin/ts-node -r /share/code/node/start/busybox/node_modules/tsconfig-paths/register.js --project /share/code/node/start/busybox/tsconfig.json --transpileOnly /share/code/node/start/busybox/src/commander/http-server.ts -p 80


## Takeaways

**Dir bin, src/commander**

For command `runTsExport`, two node process will be created for one bin command, it will cost may resource. You can run `runTsExport -d` first and run the command output again as second step.

## Notice

**About --swc of runTsExport**

--swc can speed up logic of runTsExport from 5s to 2s, but should install depended packages: `npm install -g @swc/core @swc/helpers`