import path from 'path';
import {CP, Daemon, getCpConfigByScriptPath, getScriptFullpath} from '@src/service/external';
import {TcpGateWayOptions} from '@src/types';

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
    spawnConfig: getCpConfigByScriptPath<CP.DebugServerConfig>(getScriptFullpath('debug-server.ts'), {
      spawnOptions: {
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      },
      infoToCp: {config: {port: 3800}},
      maxWaitTime4Ipc: 20,
    }),
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
      path.resolve(__dirname, 'script/tcp-gateway.ts'),
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

export const cpManagerConfigMap = [debugServer, tcpGateway].reduce<{[key: string]: Daemon.CpManagerConfig}>(
  (sum, func) => {
    const config = func();
    return {
      ...sum,
      [config.id]: config,
    };
  },
  {}
);
