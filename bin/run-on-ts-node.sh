#!/bin/sh
echo ts-node -r /Users/wuxifei/code/node/tool/busybox/node_modules/tsconfig-paths/register.js --project /Users/wuxifei/code/node/tool/busybox/tsconfig.json --swc "$@"
ts-node -r /Users/wuxifei/code/node/tool/busybox/node_modules/tsconfig-paths/register.js --project /Users/wuxifei/code/node/tool/busybox/tsconfig.json --swc "$@"