import fs from 'fs';
import path from 'path';
import {logColorful, selectOption, linkFile} from '../service/external';
import {BIN_TO_COMMAND} from './config';

export async function linkBin(linkDir: string, binDir: string) {
  const notExistDir = [linkDir, binDir].find(it => !fs.existsSync(it));
  if (notExistDir) {
    throw new Error(`dir not exist: ${linkDir}`);
  }

  /** select the type of bin file to link: .js or .ts */
  const {label: suffix} = await selectOption(
    ['.js', '.ts'].map(label => ({label})),
    {
      tips: ['Please select the type of bin file to link'],
    }
  );
  const binsToLink = Object.entries(BIN_TO_COMMAND)
    .filter(([_, config]) => !config.noLink)
    .map(it => it[0]);
  for (const binName of binsToLink) {
    // link can't be overrided, so remove it first
    const linkFile = path.resolve(linkDir, binName);
    const binFile = path.join(binDir, binName + suffix);
    linkFile(binFile, linkFile);
    logColorful({color: 'green'}, `Created Link: ${linkFile} -> ${binFile}`);
  }
  logColorful({color: 'red'}, `export PATH=${linkDir}:$PATH`);
}
