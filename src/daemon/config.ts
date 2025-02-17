/**
 * Add child process id to make it easy to find the process even daemon process is die
 */
import path from 'path';
import {CP, Daemon, getCpConfigByScriptPath, getScriptFullpath, tryUseJsFile} from '@src/service/external';
import {Env, TcpGateWayOptions} from '@src/types';

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
        params: [id],
      }
    ),
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
    spawnConfig: getCpConfigByScriptPath<TcpGateWayOptions>(
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
    spawnConfig: getCpConfigByScriptPath<TcpGateWayOptions>(
      tryUseJsFile(path.resolve(__dirname, 'script/tcp-gateway.ts')),
      {
        spawnOptions: {
          stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
        },
        infoToCp: {
          config: {
            env: process.env.NODE_ENV ? (process.env.NODE_ENV as Env) : 'local',
          },
        },
        maxWaitTime4Ipc: 20,
        params: [id],
      }
    ),
  };
  return config;
}
