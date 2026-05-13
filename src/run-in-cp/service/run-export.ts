import fs from 'fs';
import {logColorful} from '../../../modules/lib/node/log';
import {getSpawnConfigForRunExport} from '../../../modules/lib/node/utils/run-script-via-wrapper';
import {SpawnConfig, SpawnScriptOptions} from '../../../modules/lib/node/types/child_process/common';
import {NodeCpWrapScriptOptions} from '../../../modules/lib/node/utils/run-script-via-wrapper/types';
import {deepMerge} from '../../../modules/lib/js/service/deep';
import {RunNodeExportOptions} from './types';
import {serializeSpawnResponse, spawnAndTryIpc} from '../../../modules/lib/node/child-process/spawn';

/**
 * Some restriction of config file
 * 1. config file should use commonjs grammar, as bin logic may run on node runtime
 * 2. should export config in the way module.exports.config = ..
 * Content format of config file:
 * module.exports.config = {
 *  preScript: path.join(__dirname, 'init-env.ts'),
 *  runtimeOptions: {
 *    '--swc': undefined,
 *    '--transpileOnly': true,
 *  },
 * };
 */
function parseConfigFile(configFile?: string) {
  if (!configFile) {
    return {};
  }
  if (!fs.existsSync(configFile)) {
    throw new Error(`config file provide not exist: ${configFile}`);
  }
  let spawnScriptOptions: Partial<SpawnScriptOptions<any, NodeCpWrapScriptOptions>> = {};
  try {
    const info = require(configFile);
    if (info?.config === undefined) {
      throw new Error(`config variable is not exported from config file`);
    }
    spawnScriptOptions = info.config;
  } catch (err) {
    logColorful({color: 'red'}, err);
  }
  return spawnScriptOptions;
}

export function toSpawnScriptOptions(options: RunNodeExportOptions) {
  const {funcName, funcParams, options: {configFile} = {}} = options;
  const spawnWrapperOptions: SpawnScriptOptions<any, NodeCpWrapScriptOptions> = {
    infoToCp: {
      runTargetScriptOptions: {
        runExportedFunc: true,
        funcName,
        funcParams,
      },
    },
    params: [funcName, ...funcParams].filter(Boolean).map(String),
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
  return serializeSpawnResponse(response);
};
