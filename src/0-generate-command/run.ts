#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {goOnOrNot} from '../service/external';
import {buildJs} from './0-build';
import {generateBinFile} from './1-generate-bin';
import {linkBin} from './2-link-bin';

export async function generate() {
  if (
    await goOnOrNot({
      tips: ['build ts or not'],
      defaultValue: true,
    })
  ) {
    await buildJs();
  }
  if (
    await goOnOrNot({
      tips: ['generate bin files'],
      defaultValue: true,
    })
  ) {
    generateBinFile();
  }
}

export async function link(linkDir: string) {
  await generate();
  if (
    await goOnOrNot({
      tips: ['link bin files'],
      defaultValue: true,
    })
  ) {
    linkBin(linkDir);
  }
}
const program = new Command();
program
  .command('generate')
  .description('generate bin command')
  .action(async () => {
    await generate();
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
    await new Promise(res => process.nextTick(res));
    await link(linkDir);
  });

program.parse(process.argv);
