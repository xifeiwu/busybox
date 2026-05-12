import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {logColorful} from '../../modules/lib/node/log';
import {runScriptInCP} from '../../modules/lib/node/utils/run-script-in-cp';
import {SpawnScriptOptions} from '../../modules/lib/node/types/child_process/common';
import {NodeCpWrapScriptOptions} from '../../modules/lib/node/utils/run-script-in-cp/types';

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
  let spawnConfig: Partial<SpawnScriptOptions<any, NodeCpWrapScriptOptions>> = {};
  if (configFile === undefined) {
    return spawnConfig;
  }
  if (fs.existsSync(configFile)) {
    try {
      const info = require(configFile);
      if (info?.config === undefined) {
        throw new Error(`config variable is not exported from config file`);
      }
      spawnConfig = info.config;
    } catch (err) {
      logColorful({color: 'red'}, err);
    }
  } else {
    throw new Error(`config file provide not exist: ${configFile}`);
  }
  return spawnConfig;
}

export const handler = async (scriptPath, funcName, funcParams, options) => {
  const {dryRun, configFile} = options;
  const spawnConfig = parseConfigFile(configFile);
  const targetScript = path.resolve(process.cwd(), scriptPath);
  try {
    const responseFromCp = await runScriptInCP<any, NodeCpWrapScriptOptions>(targetScript, {
      dryRun,
      spawnWrapperOptions: {
        infoToCp: {
          runTargetScriptOptions: {
            funcName,
            funcParams,
            runTheOnlyFuncDirectly: true,
            runExportedFunc: true,
          },
        },
        ...spawnConfig,
      },
    });
    logColorful({color: 'black'}, 'responseFromCp:', responseFromCp);
  } catch (err) {
    console.log(`catch Error:`);
    logColorful({color: 'red'}, err.message);
    console.error(err);
    throw err;
  }
};

const program = new Command();
program.name('runTsExport').description('utility for process handling');
program
  .argument('<scriptPath>', 'path to ts file to run')
  .argument('[funcName]', 'name of function')
  .argument('[funcParams...]', 'params passed to the function')
  .option('-d, --dry-run', 'show the command without running it. ')
  .option('--config-file <configFile>', 'config file for RunScriptInCPOptions')
  .action(handler);
program.parse(process.argv);
