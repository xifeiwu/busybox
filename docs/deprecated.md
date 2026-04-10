## Start script using forever on server side

forever start /share/nvm/versions/node/v18.18.0/bin/ts-node -r /share/code/node/start/busybox/node_modules/tsconfig-paths/register.js --project /share/code/node/start/busybox/tsconfig.json --transpileOnly /share/code/node/start/busybox/src/command/http-server.ts -p 80