## Intro

This is a busybox for frequently used stable tools.

## How to run script under dir src/commander

Take http-server as example:

**Run on local**
`runOnTsNode src/commander/http-server.ts`

**Start by forever on server**
forever start /share/nvm/versions/node/v18.18.0/bin/ts-node -r /share/code/node/start/busybox/node_modules/tsconfig-paths/register.js --project /share/code/node/start/busybox/tsconfig.json --transpileOnly /share/code/node/start/busybox/src/commander/http-server.ts -p 80

## Use command runTsExport in vscoce

For the case of vscode `can not found path of runtimeExecutable on launch.json`:

Append `alias runTsExport='${HOME}/code/bin/runTsExport'` to `.zshrc`, start vscode from the project dirctory by running command `code .`.

