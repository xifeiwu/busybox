#!/usr/bin/env ts-node --transpile-only
import {Command} from 'commander';
import {goOnOrNot} from '../../modules/lib/node/readline';
import {getFilePathInfo} from '../../modules/lib/node/path';
import {execCmdWithOptions} from '../../modules/lib/node/child-process';
import {logColorful} from '../../modules/lib/node/log';
import {compile} from './0-compile';
import {generateBinFile, linkBin} from './1-link-bin';
import {DEFAULT_BIN_DIR, getDistVersion, ProjectMode} from './service';
import {DIR_PROJECT} from '../service';

/**
 * Whether this file is the original .ts file or .js file in output dist dir
 * For the case of run this bin in dist:
 * copy dist.tar.gz to target platform, and link bin file to global PATH
 */
const projectMode = getFilePathInfo(__filename).extname.slice(1) as ProjectMode;

/**
 * Check if compile is needed
 */
async function checkCompile() {
  /**
   * Check whether project is compiled or not, before generate bin file.
   */
  const distVersion = getDistVersion();
  if (
    !distVersion ||
    (await goOnOrNot({
      tips: [`current dist version is: ${distVersion}`, 'recompile project or not?'],
      defaultValue: true,
    }))
  ) {
    await compile();
  }
}

function tarGz() {
  const distVersion = getDistVersion();
  if (!distVersion) {
    throw new Error(`Can't find dist version, make sure project is compiled`);
  }
  process.chdir(DIR_PROJECT);
  const gzFile = `busybox-dist.${distVersion.replaceAll(':', '-')}.tar.gz`;
  execCmdWithOptions(`tar -zcvf ${gzFile} ./dist`);
  return gzFile;
}

const program = new Command();

program
  .command('all [linkDir]')
  .alias('link')
  .description('generate and link bin command')
  .action(async linkDir => {
    if (projectMode === 'ts') {
      await checkCompile();
    }
    if (!linkDir) {
      linkDir = DEFAULT_BIN_DIR;
    }
    await generateBinFile({projectMode});
    await linkBin(linkDir, {projectMode});
  });

program
  .command('compile')
  .description('compile project to get dist project')
  .action(async () => {
    if (projectMode === 'js') {
      throw new Error(`This command not support in dist project`);
    }
    await compile();
  });

program
  .command('gz')
  .description('tar and gz dist folder')
  .action(async () => {
    if (projectMode === 'js') {
      throw new Error(`This command not support in dist project`);
    }
    const tzFile = tarGz();
    logColorful({}, tzFile);
  });
program.parse(process.argv);
