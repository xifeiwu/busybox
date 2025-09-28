import {Command} from 'commander';
import {syncUpGitReposByDir} from '../../modules/lib/node/utils';

const program = new Command();
program.name('syncup gitmodules').description('sync up git modules by config');
program
  .argument('[gitmoduleConfigFile]', 'path to ts file to run')
  .action(async (gitmoduleConfigFile: string) => {
    const cwd = process.cwd();
    syncUpGitReposByDir({dir: cwd});
  });

program.parse(process.argv);
