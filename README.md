## Intro

This is a busybox for frequently used stable tools.

## How to run script under dir src/commander

Take http-server as example: `runOnTsNode src/commander/http-server.ts`

## Use command runTsExport in vscoce

For the case of vscode `can not found path of runtimeExecutable on launch.json`:

Append `alias runTsExport='${HOME}/code/bin/runTsExport'` to `.zshrc`, start vscode from the project dirctory by running command `code .`.
