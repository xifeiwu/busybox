import {logColorful} from '../../../modules/lib/node/log';
import {getSpawnConfigForRunExport} from '../../../modules/lib/node/utils/run-script-via-wrapper';
import {
  getSpawnConfigByScript,
  serializeSpawnResponse,
  spawnAndTryIpc,
} from '../../../modules/lib/node/child-process/spawn';
import {parseConfigFile} from './common';
import {RunNodeScriptOptions} from './types';

function toSpawnConfig(scriptPath: string, options: RunNodeScriptOptions) {
  const {options: {configFile} = {}} = options;
  const config = parseConfigFile(configFile);
  const hasPreScript = config.infoToCp?.preScript;
  config.maxWaitCpResInSec = 60 * 60;

  if (hasPreScript) {
    return getSpawnConfigForRunExport(scriptPath, config);
  } else {
    return getSpawnConfigByScript(scriptPath, config);
  }
}

export const runScript = async (scriptPath: string, options: RunNodeScriptOptions) => {
  const {options: {dryRun} = {}} = options;
  const spawnConfig = toSpawnConfig(scriptPath, options);
  logColorful({color: 'magenta'}, 'spawnConfig:', spawnConfig);
  if (dryRun) {
    return;
  }
  const response = await spawnAndTryIpc(spawnConfig, {stdinRawMode: true});
  const result = serializeSpawnResponse(response);
  // logColorful({color: 'green'}, 'child process info:', {ppid: process.pid, ...result});
  return result;
};
