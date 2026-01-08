import path from 'path';
import {Command} from 'commander';
import {logColorful} from '../../modules/lib/node/log';
import {runScriptInCP} from '../../modules/lib/node/utils/run-script';

const program = new Command();
program.name('runTsExport').description('utility for process handling');
program
  .argument('<scriptPath>', 'path to ts file to run')
  .argument('[funcName]', 'name of function')
  .argument('[funcParams...]', 'params passed to the function')
  .option(
    '--pre-script <preScript>',
    'run this script before run main script, to do some pre logic, such as set env'
  )
  .option('-a, --all', 'run all exported function')
  .option('-d, --dry-run', 'show the command without running it. ')
  .action(async (scriptPath, funcName, funcParams, options) => {
    const {all, dryRun, preScript} = options;
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
        preScript,
        targetScript,
        runTargetScriptOptions: {
          funcName,
          funcParams,
          runTheOnlyFuncDirectly: true,
          runExportedFunc: true,
        },
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
