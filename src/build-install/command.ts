import {Command} from 'commander';
import {getFilePathInfo} from '../../modules/lib/node/path';
import {logColorful} from '../../modules/lib/node/log';
import {build} from './0-compile';
import {linkBin} from './1-link-bin';
import {backupDist, ProjectMode} from './service';

/**
 * Whether this file is the original .ts file or .js file in output dist dir
 * For the case of run this bin in dist:
 * copy dist.tar.gz to target platform, and link bin file to global PATH
 */
const projectMode = getFilePathInfo(__filename).extname.slice(1) as ProjectMode;

const program = new Command();

program
  .command('build')
  .description('build and link bin command')
  .action(async linkDir => {
    if (projectMode === 'js') {
      throw new Error(`This command not support in dist project`);
    }
    await build();
  });
program
  .command('link [linkDir]')
  .description("link process only, it's extremely useful when want to link backup dist bin")
  .action(async linkDir => {
    await linkBin(linkDir, {projectMode});
  });
program
  .command('all [linkDir]')
  .description('build and link bin command')
  .action(async linkDir => {
    if (projectMode === 'js') {
      throw new Error(`This command not support in dist project`);
    }
    await build();
    await linkBin(linkDir, {projectMode});
  });
program
  .command('gz')
  .description('tar and gz dist folder')
  .action(async () => {
    if (projectMode === 'js') {
      throw new Error(`This command not support in dist project`);
    }
    const tzFile = backupDist();
    logColorful({color: 'green'}, tzFile);
  });
program.parse(process.argv);
