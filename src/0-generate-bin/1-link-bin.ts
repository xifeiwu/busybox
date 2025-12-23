import fs from 'fs';
import path from 'path';
import {logColorful, selectOption, linkFile as link} from '../service/external';
import {BIN_TO_COMMAND} from './config';

type Suffix = '.js' | '.ts';

export async function linkBin(linkDir: string, binDir: string, options?: {inJsMode?: boolean}) {
  const {inJsMode} = options ?? {};
  const notExistDir = [linkDir, binDir].find(it => !fs.existsSync(it));
  if (notExistDir) {
    throw new Error(`dir not exist: ${linkDir}`);
  }
  const suffixList: Suffix[] = inJsMode ? ['.js'] : ['.js', '.ts'];
  const tips = [`Will link command to dir: ${linkDir}`];
  if (inJsMode !== true) {
    tips.push('Please select the type of bin file to link');
  }
  /** select the type of bin file to link: .js or .ts */
  const {label: suffix} = await selectOption(
    suffixList.map(label => ({label})),
    {
      tips,
    }
  );
  const binsToLink = Object.entries(BIN_TO_COMMAND)
    .filter(([_, config]) => !config.noLink)
    .map(it => it[0]);
  for (const binName of binsToLink) {
    // link can't be overrided, so remove it first
    const linkFile = path.resolve(linkDir, binName);
    const binFile = path.join(binDir, binName + suffix);
    link(binFile, linkFile);
    logColorful({color: 'green'}, `Created Link: ${linkFile} -> ${binFile}`);
  }
  logColorful({color: 'red'}, `export PATH=${linkDir}:$PATH`);
}
