import fs from 'fs';
import path from 'path';
import {logColorful} from '../../../modules/lib/node/log';
import {runScriptInCP} from '../../../modules/lib/node/utils/run-script-via-wrapper';
import {SpawnScriptOptions} from '../../../modules/lib/node/types/child_process/common';
import {NodeCpWrapScriptOptions} from '../../../modules/lib/node/utils/run-script-via-wrapper/types';
import {deepMerge} from '../../../modules/lib/js/service/deep';
import {RunTsExportOptions} from './types';

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
  let spawnConfig: Partial<SpawnScriptOptions<any, NodeCpWrapScriptOptions>> = {};
  try {
    const info = require(configFile);
    if (info?.config === undefined) {
      throw new Error(`config variable is not exported from config file`);
    }
    spawnConfig = info.config;
  } catch (err) {
    logColorful({color: 'red'}, err);
  }
  return spawnConfig;
}

function getSpawnWrapperOptions(options: RunTsExportOptions) {
  const {funcName, funcParams, options: {configFile} = {}} = options;
  const spawnWrapperOptions: SpawnScriptOptions<any, NodeCpWrapScriptOptions> = {
    infoToCp: {
      runTargetScriptOptions: {
        funcName,
        funcParams,
      },
    },
    params: [funcName, ...funcParams].filter(Boolean),
  };
  const result = deepMerge(spawnWrapperOptions, parseConfigFile(configFile));
  return result;
}

export const runTsExport = async (scriptPath: string, options: RunTsExportOptions) => {
  const {options: {dryRun} = {}} = options;
  const spawnConfig = getSpawnWrapperOptions(options);
  const targetScript = path.resolve(process.cwd(), scriptPath);
  try {
    const responseFromCp = await runScriptInCP<any, NodeCpWrapScriptOptions>(targetScript, {
      dryRun,
      spawnWrapperOptions: spawnConfig,
    });
    logColorful({color: 'black'}, 'responseFromCp:', responseFromCp);
  } catch (err) {
    console.log(`catch Error:`);
    logColorful({color: 'red'}, err.message);
    console.error(err);
    throw err;
  }
};
