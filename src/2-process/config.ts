/**
 * Add child process id to make it easy to find the process even daemon process is die
 */
import path from 'path';
import {
  LaunchCpConfig,
  tryUseJsFile,
  Env,
  getSpawnConfigByScript,
  CP,
  MonitorConfig,
  isNumber,
} from '../service/external';
import {TcpGateWayOptions} from '../types';

// const defaultMaxWaitCpResInSec = 60;

const defaultMonitorConfig: MonitorConfig = {
  retry: {
    maxCount: 3,
    minInterval: 5000,
  },
};
const defaultMaxWaitCpResInSec = 6;

export const launchProcConfigMap: Record<string, Omit<LaunchCpConfig, 'id'>> = {
  'customized-server': {
    spawnConfig: {
      scriptPath: path.resolve(
        __dirname,
        '../../../modules/lib/node/child-process/cp-script/debug-server.ts'
      ),
      infoToCp: {
        port: 3333,
      },
      // maxWaitCpResInSec: defaultMaxWaitCpResInSec,
    },
  },
};

export const launchProcConfigList: LaunchCpConfig[] = Object.entries(launchProcConfigMap).map(([id, config]) => {
  let spawnConfig = {...config.spawnConfig};
  if (spawnConfig.infoToCp && !isNumber(spawnConfig.maxWaitCpResInSec)) {
    spawnConfig.maxWaitCpResInSec = defaultMaxWaitCpResInSec;
  }
  return {
    id,
    spawnConfig,
    monitorConfig: defaultMonitorConfig,
  };
});

// TODO: add to launchProcConfigList
export const cpEntryMap = [debugServer, tlsGateway, tcpGateway].reduce<{
  [key: string]: LaunchCpConfig;
}>((sum, fn) => {
  const entry = fn();
  return {...sum, [entry.id]: entry};
}, {});

const configIdList = Object.keys(cpEntryMap);


export function debugServer(): LaunchCpConfig {
  const id = 'customized-server';
  return {
    id,
    spawnConfig: getSpawnConfigByScript<CP.DebugServerConfig>(tryUseJsFile(__filename), {
      spawnOptions: {
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      },
      params: [id],
      infoToCp: {
        port: 3333,
      },
      maxWaitCpResInSec: 6,
    }),
  };
}

export function tlsGateway(): LaunchCpConfig {
  const id = 'tls-gateway';
  return {
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
    monitorConfig: defaultMonitorConfig,
  };
}

export function tcpGateway(): LaunchCpConfig {
  const id = 'tcp-gateway';
  return {
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
        maxWaitCpResInSec: defaultMaxWaitCpResInSec,
        params: [id],
      }
    ),
    monitorConfig: defaultMonitorConfig,
  };
}
