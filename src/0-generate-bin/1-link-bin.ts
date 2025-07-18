import fs from 'fs';
import path from 'path';
import {logColorful, selectOption} from '../service/external';
import {BIN_TO_COMMAND} from './service';
// import {DIR_PROJECT} from '../service';

function isLinkFileExist(filePath) {
  try {
    if (fs.lstatSync(filePath)) {
      return true;
    }
  } catch {
    return false;
  }
}

export async function linkBin(linkDir: string, binDir: string) {
  const notExistDir = [linkDir, binDir].find(it => !fs.existsSync(it));
  if (notExistDir) {
    throw new Error(`dir not exist: ${linkDir}`);
  }

  /** select the type of bin file to link: .js or .ts */
  const {label: suffix} = await selectOption(
    ['.js', '.ts'].map(label => ({label})),
    {
      tip: 'Please select the type of bin file to link',
    }
  );
  const binsToLink = Object.entries(BIN_TO_COMMAND)
    .filter(([_, config]) => !config.noLink)
    .map(it => it[0]);
  for (const binName of binsToLink) {
    // link can't be overrided, so remove it first
    const linkFile = path.resolve(linkDir, binName);
    const binFile = path.join(binDir, binName + suffix);
    if (!fs.existsSync(binFile)) {
      logColorful({color: 'red'}, `binFile not exist: ${binFile}`);
      continue;
    }
    if (isLinkFileExist(linkFile)) {
      fs.unlinkSync(linkFile);
      logColorful({}, `Unlink file: ${linkFile}`);
    }
    const relativePath = path.relative(path.dirname(linkFile), binFile);
    fs.symlinkSync(relativePath, linkFile);
    logColorful({color: 'green'}, `Created Link: ${linkFile} -> ${binFile}`);
  }
  logColorful({color: 'red'}, `export PATH=${linkDir}:$PATH`);
}
