#!/usr/bin/env ts-node
import path from 'path';
import {Command} from 'commander';
import {goOnOrNot} from '../../modules/lib/node/readline';
import {getFilePathInfo} from '../../modules/lib/node/path';
import {logCmdAndexecSync} from '../../modules/lib/node/child-process';
import {logColorful} from '../../modules/lib/node/log';
import {compile} from './0-compile';
import {linkBin} from './1-link-bin';
import {DEFAULT_BIN_DIR, getDistVersion} from './service';
import {DIR_DIST, DIR_PROJECT} from '../service';

const runInDist = getFilePathInfo(__filename).extname === '.js';
/**
 * link bin file to global bin dir.
 * Check if compile action is needed before link bin.
 */
async function toLinkBin(linkDir: string, binDir: string) {
  /**
   * Check whether project is compiled or not, before generate bin file.
   */
  const distVersion = getDistVersion();
  if (!distVersion) {
    await compile();
  } else {
    if (
      await goOnOrNot({
        tips: [`current dist version is: ${distVersion}`, 'recompile project or not?'],
        defaultValue: true,
      })
    ) {
      await compile();
    }
  }
  await linkBin(linkDir, binDir);
}

function tarGz() {
  const distVersion = getDistVersion();
  if (!distVersion) {
    throw new Error(`Can't find dist version, make sure project is compiled`);
  }
  process.chdir(DIR_PROJECT);
  const gzFile = `busybox-dist.${distVersion.replaceAll(':', '-')}.tar.gz`;
  logCmdAndexecSync(`tar -zcvf ${gzFile} ./dist`);
  return gzFile;
}

const program = new Command();
program
  .command('compile')
  .description('compile project to get dist project')
  .action(async () => {
    if (runInDist) {
      throw new Error(`This command not support in dist project`);
    }
    await compile();
  });

program
  .command('run [linkDir]')
  .alias('link')
  .description('generate and link bin command')
  .action(async linkDir => {
    if (!linkDir) {
      linkDir = DEFAULT_BIN_DIR;
    }
    if (
      !(await goOnOrNot({
        tips: [`Will link command to dir: ${linkDir}?`],
        defaultValue: true,
        style: {
          color: 'red',
        },
      }))
    ) {
      throw new Error(`Manually Interupt`);
    }
    const binDir = path.join(DIR_PROJECT, 'bin');
    if (runInDist) {
      linkBin(linkDir, binDir);
    } else {
      /** readline on next tick, to avoid two readline use same input */
      await new Promise(res => process.nextTick(res));
      toLinkBin(linkDir, binDir);
    }
  });
program
  .command('gz')
  .description('tar and gz dist folder')
  .action(async () => {
    const tzFile = tarGz();
    logColorful({}, tzFile);
  });
program.parse(process.argv);
