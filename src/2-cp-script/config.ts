/**
 * Add child process id to make it easy to find the process even daemon process is die
 */
import path from 'path';
import {
  LaunchCpConfig,
  Env,
  MonitorConfig,
  isNumber,
  logColorful,
  selectOption,
  getPreferredFileByExt,
} from '../service/external';

const defaultMonitorConfig: MonitorConfig = {
  retry: {
    maxCount: 3,
    minInterval: 5000,
  },
  logCpOut: true,
};
const defaultMaxWaitCpResInSec = 6;

/**
 * Simple version of LaunchCpConfig
 */
const simpleProcConfigMap: Record<string, Omit<LaunchCpConfig, 'id'>> = {
  'customized-server': {
    spawnConfig: {
      scriptPath: path.resolve(__dirname, '../../modules/lib/node/utils/cp-script/debug-server.ts'),
      infoToCp: {
        port: 3333,
      },
    },
  },
  'tcp-gateway': {
    spawnConfig: {
      scriptPath: path.resolve(__dirname, '../tcp-gateway/cp-script.ts'),
      infoToCp: {
        config: {
          env: process.env.NODE_ENV ? (process.env.NODE_ENV as Env) : Env.local,
        },
      },
      params: ['tcp-gateway'],
    },
  },
};

/**
 * Will try to use .js file if .ts file exists.
 * By default, will start cp in mointored mode, as log is not ready.
 */
const launchProcConfigRecord: Record<string, LaunchCpConfig> = Object.fromEntries(
  Object.entries(simpleProcConfigMap).map(([id, config]) => {
    let spawnConfig = {...config.spawnConfig};
    if ('scriptPath' in spawnConfig && spawnConfig.scriptPath.endsWith('.ts')) {
      spawnConfig.scriptPath = getPreferredFileByExt(spawnConfig.scriptPath, {
        preferredExtSequence: ['.js'],
      });
    }
    if (spawnConfig.infoToCp && !isNumber(spawnConfig.maxWaitCpResInSec)) {
      spawnConfig.maxWaitCpResInSec = defaultMaxWaitCpResInSec;
    }
    return [id, {id, spawnConfig, monitorConfig: defaultMonitorConfig}];
  })
);

const configIdList = Object.keys(launchProcConfigRecord);

export async function selectConfigById(id?: string): Promise<LaunchCpConfig> {
  if (id && launchProcConfigRecord[id]) {
    return launchProcConfigRecord[id];
  }
  if (id && !launchProcConfigRecord[id]) {
    logColorful({color: 'yellow'}, `Unknown config id "${id}", choose from list.`);
  }
  const selected = await selectOption(
    configIdList.map(x => ({
      label: x,
      id: x,
    }))
  );
  return launchProcConfigRecord[selected.id];
}

// export function tcpGateway(): LaunchCpConfig {
//   const id = 'tcp-gateway';
//   return {
//     id,
//     spawnConfig: getSpawnConfigByScript<TcpGateWayOptions>(
//       tryUseJsFile(path.resolve(__dirname, 'tcp-gateway.ts')),
//       {
//         spawnOptions: {
//           stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
//         },
//         infoToCp: {
//           config: {
//             env: process.env.NODE_ENV ? (process.env.NODE_ENV as Env) : Env.local,
//           },
//         },
//         maxWaitCpResInSec: defaultMaxWaitCpResInSec,
//         params: [id],
//       }
//     ),
//     monitorConfig: defaultMonitorConfig,
//   };
// }
