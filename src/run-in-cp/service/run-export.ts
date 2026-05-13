import {logColorful} from '../../../modules/lib/node/log';
import {getSpawnConfigForRunExport} from '../../../modules/lib/node/utils/run-script-via-wrapper';
import {SpawnScriptOptions} from '../../../modules/lib/node/types/child_process/common';
import {NodeCpWrapScriptOptions} from '../../../modules/lib/node/utils/run-script-via-wrapper/types';
import {deepMerge} from '../../../modules/lib/js/service/deep';
import {RunNodeExportOptions} from './types';
import {serializeSpawnResponse, spawnAndTryIpc} from '../../../modules/lib/node/child-process/spawn';
import {parseConfigFile} from './common';

export function toSpawnScriptOptions(options: RunNodeExportOptions) {
  const {funcName, funcParams, options: {configFile} = {}} = options;
  const spawnWrapperOptions: SpawnScriptOptions<any, NodeCpWrapScriptOptions> = {
    infoToCp: {
      runTargetScriptOptions: {
        runExportedFunc: true,
        runTheOnlyFuncDirectly: true,
        funcName,
        funcParams,
      },
    },
    params: [funcName, ...funcParams].filter(Boolean).map(String),
    // max wait time for child process to return result
    maxWaitCpResInSec: 60 * 60,
  };
  const merged = deepMerge(spawnWrapperOptions, parseConfigFile(configFile));
  return merged;
}

export function toWrapperSpawnConfig(scriptPath: string, options: RunNodeExportOptions) {
  const spawnScriptOptions = toSpawnScriptOptions(options);
  const wrapperSpawnConfig = getSpawnConfigForRunExport(scriptPath, spawnScriptOptions);
  return wrapperSpawnConfig;
}

export const runExport = async (scriptPath: string, options: RunNodeExportOptions) => {
  const {options: {dryRun} = {}} = options;
  const spawnWrapperConfig = toWrapperSpawnConfig(scriptPath, options);
  logColorful({color: 'magenta'}, 'spawnWrapperConfig:', spawnWrapperConfig);
  if (dryRun) {
    return;
  }
  const response = await spawnAndTryIpc(spawnWrapperConfig, {stdinRawMode: true});
  const result = serializeSpawnResponse(response);
  logColorful({color: 'green'}, 'child process info:', {ppid: process.pid, ...result});
  return result;
};
