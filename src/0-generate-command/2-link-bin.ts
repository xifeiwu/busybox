import fs from 'fs';
import path from 'path';
import {logColorful, selectOption} from '../service/external';
import {BIN_TO_FEATURE} from './config';
import {DIR_PROJECT} from '../service';

function isLinkFileExist(filePath) {
  try {
    if (fs.lstatSync(filePath)) {
      return true;
    }
  } catch {
    return false;
  }
}

export async function linkBin(linkDir: string) {
  const {label: suffix} = await selectOption(['.ts', '.js'].map(label => ({label})));

  for (const binName of Object.keys(BIN_TO_FEATURE)) {
    // link can't be overrided, so remove it first
    const linkFile = path.resolve(linkDir, binName);
    const binFile = path.join(DIR_PROJECT, 'bin', binName + suffix);
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
