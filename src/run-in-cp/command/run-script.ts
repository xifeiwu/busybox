import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {logColorful} from '../../../modules/lib/node/log';
import {runScriptInCP} from '../../../modules/lib/node/utils/run-script-via-wrapper';
import {SpawnScriptOptions} from '../../../modules/lib/node/types/child_process/common';

export const handler = async (scriptPath, options) => {
  const {dryRun, configFile} = options;
  let spawnOptions: Partial<SpawnScriptOptions> = {};
  if (fs.existsSync(configFile)) {
    try {
      const info = require(configFile);
      spawnOptions = info?.config;
    } catch (err) {
      logColorful({color: 'red'}, err);
    }
  }
  const targetScript = path.resolve(process.cwd(), scriptPath);
  try {
    const responseFromCp = await runScriptInCP(targetScript, {
      dryRun,
      spawnOptions,
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
program.name('runNodeScript').description('utility for process handling');
program
  .argument('<scriptPath>', 'path to ts file to run')
  .option('-d, --dry-run', 'show the command without running it. ')
  .action(handler);
program.parse(process.argv);
