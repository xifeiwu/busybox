import fs from 'fs';
import path from 'path';
import {CP, Daemon, getCpConfigByScriptPath, getScriptFullpath, logColorful} from '@src/service/external';
import {TcpGateWayOptions} from '@src/types';

function tryUseJsFile(fullPath: string) {
  let jsFilePath: string;
  if (fullPath.endsWith('.ts')) {
    jsFilePath = fullPath.replace(/ts$/, 'js');
  }
  if (jsFilePath && fs.existsSync(jsFilePath)) {
    return jsFilePath;
  }
  return fullPath;
}
export function debugServer() {
  const id = 'debug-server';
  const config: Daemon.CpManagerConfig = {
    id,
    managerConfig: {
      retry: {
        maxCount: 3,
        minInterval: 5000,
      },
    },
    spawnConfig: getCpConfigByScriptPath<CP.DebugServerConfig>(
      tryUseJsFile(getScriptFullpath('debug-server.ts')),
      {
        spawnOptions: {
          stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
        },
        infoToCp: {config: {port: 3800}},
        maxWaitTime4Ipc: 20,
      }
    ),
  };
  return config;
}
export function tcpGateway() {
  const id = 'tcp-gateway';
  const config: Daemon.CpManagerConfig = {
    id,
    managerConfig: {
      retry: {
        maxCount: 3,
        minInterval: 5000,
      },
    },
    spawnConfig: getCpConfigByScriptPath<TcpGateWayOptions>(
      tryUseJsFile(path.resolve(__dirname, 'script/tcp-gateway.ts')),
      {
        // spawnOptions: {
        //   stdio,
        // },
        // infoToCp: {},
        maxWaitTime4Ipc: 20,
      }
    ),
  };
  return config;
}
