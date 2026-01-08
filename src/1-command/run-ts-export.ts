import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {logColorful} from '../../modules/lib/node/log';
import {runScriptInCP} from '../../modules/lib/node/utils/run-script';
import {RunScriptInCPOptions} from '../../modules/lib/node/types/utils';

export const handler = async (scriptPath, funcName, funcParams, options) => {
  const {dryRun, configFile} = options;
  let spawnConfig: Partial<RunScriptInCPOptions> = {};
  // const c: Partial<RunScriptInCPOptions> = {
  //   preScript: '',
  //   runtimeOptions: {
  //     '--swc': undefined,
  //     '--transpileOnly': true,
  //   },
  // };
  if (fs.existsSync(configFile)) {
    try {
      const info = require(configFile);
      spawnConfig = info?.config;
    } catch (err) {
      logColorful({color: 'red'}, err);
    }
  }
  /**
   * Format of argv:
   * [
   *   '/Users/wuxifei/.nvm/versions/node/v18.12.0/bin/ts-node',
   *   '/Users/wuxifei/code/bin/runTsExport',
   *   'modules/lib/fe/lib/humanize/test.ts',
   *   'testIntword'
   * ]
   */
  const targetScript = path.resolve(process.cwd(), scriptPath);
  try {
    const responseFromCp = await runScriptInCP({
      dryRun,
      targetScript,
      runTargetScriptOptions: {
        funcName,
        funcParams,
        runTheOnlyFuncDirectly: true,
        runExportedFunc: true,
      },
      ...spawnConfig,
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
  .option('--config <configFile>', 'config file for RunScriptInCPOptions')
  .action(handler);
program.parse(process.argv);
