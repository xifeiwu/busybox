import {Command} from 'commander';
import {runScript} from '../service/run-script';

const program = new Command();
program.name('runNodeScript').description('utility for process handling');
program
  .argument('<scriptPath>', 'path to ts file to run')
  .option('-d, --dry-run', 'show the command without running it.')
  .option('--config-file <configFile>', 'config file for RunScriptInCPOptions')
  .action((scriptPath, options) => {
    runScript(scriptPath, {options});
  });
program.parse(process.argv);
