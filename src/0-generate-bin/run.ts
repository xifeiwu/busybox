#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {goOnOrNot} from '../service/external';
import {buildJs} from './0-build';
import {generateBinFile} from './1-generate-bin';
import {linkBin} from './2-link-bin';
import {getDistVersion} from './config';

export async function toGenerateBinFile() {
  /**
   * Check whether project is compiled or not, before generate bin file.
   */
  const distVersion = getDistVersion();
  if (!distVersion) {
    buildJs();
  } else {
    if (
      await goOnOrNot({
        tips: [`current dist version is: ${distVersion}`, 'recompile project or not?'],
        defaultValue: true,
      })
    ) {
      await buildJs();
    }
  }
  generateBinFile();
}

export async function link(linkDir: string) {
  await toGenerateBinFile();
  if (
    await goOnOrNot({
      tips: ['link bin files'],
      defaultValue: true,
    })
  ) {
    linkBin(linkDir);
  }
}

/**
 * NOTICE: build, generate-bin must run on host project
 */
const program = new Command();
program
  .command('build')
  .description('build .ts file to .js')
  .action(async () => {
    await buildJs();
  });

program
  .command('generate-bin')
  .description('generate bin command')
  .action(async () => {
    await toGenerateBinFile();
  });

program
  .command('link [linkDir]')
  .description('generate and link bin command')
  .action(async linkDir => {
    if (!linkDir) {
      const {HOME} = process.env;
      linkDir = path.resolve(HOME, 'code/bin');
    }
    if (
      !(await goOnOrNot({
        tips: [`Will link command to dir: ${linkDir}`],
        defaultValue: true,
        style: {
          color: 'red',
        },
      }))
    ) {
      throw new Error(`Manually Interupt`);
    }

    if (!fs.existsSync(linkDir)) {
      fs.mkdirSync(linkDir, {recursive: true});
    }
    /** readline on next tick, to avoid two readline use same input */
    await new Promise(res => process.nextTick(res));
    await link(linkDir);
  });

program.parse(process.argv);
