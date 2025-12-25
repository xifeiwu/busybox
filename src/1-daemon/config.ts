/**
 * Add child process id to make it easy to find the process even daemon process is die
 */
import path from 'path';
import {Daemon, tryUseJsFile, Env, getSpawnConfigByScript, CP} from '../service/external';
import {TcpGateWayOptions} from '../types';

const maxWaitTime4Ipc = 60;

const defaultSpawnConfig: Partial<Daemon.CpManagerConfig> = {
  managerConfig: {
    retry: {
      maxCount: 3,
      minInterval: 5000,
    },
  },
};

export function debugServer() {
  const id = 'customized-server';
  const config: Daemon.CpManagerConfig = {
    id,
    spawnConfig: getSpawnConfigByScript<CP.DebugServerConfig>(tryUseJsFile(__filename), {
      spawnOptions: {
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      },
      params: [id],
      infoToCp: {
        port: 3333,
      },
      maxWaitTime4Ipc: 6,
    }),
  };
  return config;
}

export function tlsGateway() {
  const id = 'tls-gateway';
  const config: Daemon.CpManagerConfig = {
    id,
    managerConfig: {
      retry: {
        maxCount: 3,
        minInterval: 5000,
      },
    },
    spawnConfig: getSpawnConfigByScript<TcpGateWayOptions>(
      tryUseJsFile(path.resolve(__dirname, 'script/tls-gateway.ts')),
      {
        spawnOptions: {
          stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
        },
        params: [id],
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
    spawnConfig: getSpawnConfigByScript<TcpGateWayOptions>(
      tryUseJsFile(path.resolve(__dirname, 'script/tcp-gateway.ts')),
      {
        spawnOptions: {
          stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
        },
        infoToCp: {
          config: {
            env: process.env.NODE_ENV ? (process.env.NODE_ENV as Env) : Env.local,
          },
        },
        maxWaitTime4Ipc,
        params: [id],
      }
    ),
  };
  return config;
}
