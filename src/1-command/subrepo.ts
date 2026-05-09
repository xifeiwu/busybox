import {Command} from 'commander';
import {printSubrepoConfig, syncSubreposFromWorkspace} from '../../modules/lib/node/lib/sub-repo';

const program = new Command();
program.name('subrepo').description('Manage nested git repos (subrepos) via a subrepo manifest file');

program
  .command('pull')
  .description('Clone/pull subrepos from the manifest (default: all; pass a name to sync only that entry)')
  .argument('[repoName]', 'optional subrepo key or path segment to sync only matching repos')
  .action(async (repoName?: string) => {
    await syncSubreposFromWorkspace({
      dir: process.cwd(),
      repoName: repoName?.trim() || undefined,
    });
  });

program
  .command('config')
  .description('Print resolved subrepo manifest path and listed subrepo paths')
  .action(() => {
    printSubrepoConfig(process.cwd());
  });

program.parse(process.argv);
