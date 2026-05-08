import fs from 'fs';
import path from 'path';
import {logColorful, selectOption, linkFile} from '../service/external';
import {BIN_TO_COMMAND} from './config';
import {DEFAULT_BIN_DIR, GenerateOptions} from './service';
import {DIR_DIST} from '../service';
const DIR_PROJECT = path.join(__dirname, '../../');

export async function linkBin(linkDir?: string, options?: GenerateOptions) {
  linkDir = linkDir ?? DEFAULT_BIN_DIR;
  const {projectMode = 'ts'} = options ?? {};
  const projectBinDir = path.join(DIR_PROJECT, 'bin');
  const jsBinDir = projectMode === 'ts' ? path.join(DIR_DIST, 'bin') : undefined;
  const binDirOptions: Array<{label: string; binDir: string}> = [];
  if (projectMode === 'ts') {
    binDirOptions.push({label: '.js', binDir: jsBinDir}, {label: '.ts', binDir: projectBinDir});
  } else {
    binDirOptions.push({label: '.js', binDir: projectBinDir});
  }
  const tips = [`Will link command to dir: ${linkDir}`];
  const selected = await selectOption(binDirOptions, {
    tips,
  });
  const {label: suffix, binDir} = selected;
  const notExistDir = [linkDir, binDir].find(it => !fs.existsSync(it));
  if (notExistDir) {
    throw new Error(`dir not exist: ${linkDir}`);
  }
  const binsToLink = Object.entries(BIN_TO_COMMAND)
    .filter(([_, config]) => !config.noLink)
    .map(it => it[0]);
  for (const binName of binsToLink) {
    // link can't be overrided, so remove it first
    const targetFile = path.resolve(linkDir, binName);
    const sourceFile = path.join(binDir, binName + suffix);
    linkFile(sourceFile, targetFile, {force: true});
    logColorful({color: 'green'}, `Created Link: ${targetFile} -> ${sourceFile}`);
  }
  logColorful({color: 'red'}, `export PATH=${linkDir}:$PATH`);
}
