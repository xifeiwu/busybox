import {Command} from 'commander';
import {runNodeExport} from '../service/run-export';

const program = new Command();
program.name('runNodeExport').description('utility for process handling');
program
  .argument('<scriptPath>', 'path to ts file to run')
  .argument('[funcName]', 'name of function')
  .argument('[funcParams...]', 'params passed to the function')
  .option('-d, --dry-run', 'show the command without running it. ')
  .option('--config-file <configFile>', 'config file for RunScriptInCPOptions')
  .action((scriptPath, funcName, funcParams, options) => {
    runNodeExport(scriptPath, {funcName, funcParams, options});
  });
program.parse(process.argv);
