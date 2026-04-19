/**
 * Add child process id to make it easy to find the process even daemon process is die
 */
import path from 'path';
import {LaunchCpEntry, tryUseJsFile, Env, getSpawnConfigByScript, CP, MonitorConfig} from '../service/external';
import {TcpGateWayOptions} from '../types';

const maxWaitTime4Ipc = 60;

const defaultMonitorConfig: MonitorConfig = {
  retry: {
    maxCount: 3,
    minInterval: 5000,
  },
};

export function debugServer(): LaunchCpEntry {
  const id = 'customized-server';
  return {
    cpConfig: {
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
    },
  };
}

export function tlsGateway(): LaunchCpEntry {
  const id = 'tls-gateway';
  return {
    cpConfig: {
      id,
      spawnConfig: getSpawnConfigByScript<TcpGateWayOptions>(
        tryUseJsFile(path.resolve(__dirname, 'tls-gateway.ts')),
        {
          spawnOptions: {
            stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
          },
          params: [id],
        }
      ),
    },
    monitorConfig: defaultMonitorConfig,
  };
}

export function tcpGateway(): LaunchCpEntry {
  const id = 'tcp-gateway';
  return {
    cpConfig: {
      id,
      spawnConfig: getSpawnConfigByScript<TcpGateWayOptions>(
        tryUseJsFile(path.resolve(__dirname, 'tcp-gateway.ts')),
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
    },
    monitorConfig: defaultMonitorConfig,
  };
}
