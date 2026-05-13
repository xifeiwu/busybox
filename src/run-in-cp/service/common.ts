import fs from 'fs';
import {logColorful} from '../../../modules/lib/node/log';
import {SpawnScriptOptions} from '../../../modules/lib/node/types/child_process/common';
import {NodeCpWrapScriptOptions} from '../../../modules/lib/node/utils/run-script-via-wrapper/types';

/**
 * for the format of config file, refer ../test/project/run-export.config.js
 */
export function parseConfigFile(configFile?: string) {
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
