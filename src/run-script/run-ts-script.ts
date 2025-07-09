import path from 'path';
import {Command} from 'commander';
import {logColorful} from '../../modules/lib/node/log';
import {runTsScriptInCP} from '../../modules/lib/node/utils/run-script';

const program = new Command();
program.name('runTsExport').description('utility for process handling');
program
  .argument('<scriptPath>', 'path to ts file to run')
  .option('-d, --dry-run', 'show the command without running it. ')
  .action(async (scriptPath, options) => {
    const {dryRun} = options;
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
      const responseFromCp = await runTsScriptInCP(targetScript, {
        runScriptOptions: {
          selectExportedFunc: false,
        },
        dryRun,
      });
      logColorful({color: 'black'}, 'responseFromCp:', responseFromCp);
    } catch (err) {
      console.log(`catch Error:`);
      logColorful({color: 'red'}, err.message);
      console.error(err);
      throw err;
    }
  });
program.parse(process.argv);
