import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {logColorful} from '../../modules/lib/node/log';
import {runScriptInCP} from '../../modules/lib/node/utils/run-script';
import {RunScriptInCPOptions} from '../../modules/lib/node/types/utils';

export const handler = async (scriptPath, options) => {
  const {dryRun, configFile} = options;
  let spawnConfig: Partial<RunScriptInCPOptions> = {};
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
        runExportedFunc: false,
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
  .option('-d, --dry-run', 'show the command without running it. ')
  .action(handler);
program.parse(process.argv);
