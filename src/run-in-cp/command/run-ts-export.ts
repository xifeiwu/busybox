import {Command} from 'commander';
import {runTsExport} from '../service/run-ts-export';

const program = new Command();
program.name('runTsExport').description('utility for process handling');
program
  .argument('<scriptPath>', 'path to ts file to run')
  .argument('[funcName]', 'name of function')
  .argument('[funcParams...]', 'params passed to the function')
  .option('-d, --dry-run', 'show the command without running it. ')
  .option('--config-file <configFile>', 'config file for RunScriptInCPOptions')
  .action((scriptPath, funcName, funcParams, options) => {
    runTsExport(scriptPath, {funcName, funcParams, options});
  });
program.parse(process.argv);
