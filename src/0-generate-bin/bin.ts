#!/usr/bin/env ts-node --transpile-only
import {Command} from 'commander';
import {goOnOrNot} from '../../modules/lib/node/readline';
import {getFilePathInfo} from '../../modules/lib/node/path';
import {logColorful} from '../../modules/lib/node/log';
import {compile} from './0-compile';
import {generateBinFile, linkBin} from './1-link-bin';
import {backupDist, DEFAULT_BIN_DIR, getDistVersion, ProjectMode} from './service';

/**
 * Whether this file is the original .ts file or .js file in output dist dir
 * For the case of run this bin in dist:
 * copy dist.tar.gz to target platform, and link bin file to global PATH
 */
const projectMode = getFilePathInfo(__filename).extname.slice(1) as ProjectMode;

/**
 * Check if compile is needed
 */
async function doCheckBeforeCompile() {
  /**
   * Check whether project is compiled or not, before generate bin file.
   */
  const distVersion = getDistVersion();
  if (
    distVersion &&
    !(await goOnOrNot({
      tips: [`current dist version is: ${distVersion}`, 'recompile project or not?'],
      defaultValue: true,
    }))
  ) {
    return;
  }
  await compile();
}

const program = new Command();

program
  .command('all [linkDir]')
  .description('generate and link bin command')
  .action(async linkDir => {
    if (projectMode === 'ts') {
      await doCheckBeforeCompile();
    }
    await generateBinFile({projectMode});
    await linkBin(linkDir, {projectMode});
  });

program
  .command('link [linkDir]')
  .description('link process only, it\'s extremely useful when want to link backup dist bin')
  .action(async (linkDir) => {
    if (projectMode === 'js') {
      throw new Error(`This command not support in dist project`);
    }
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
    logColorful({}, tzFile);
  });
program.parse(process.argv);
