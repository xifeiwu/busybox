import path from 'path';
import fs from 'fs';
import {DIR_PROJECT} from '../service';
import {logColorful, getDir} from '../service/external';
import {BIN_TO_COMMAND} from './config';

function generateBinContent(binPath: string, cmdPath: string) {
  if (!fs.existsSync(cmdPath)) {
    throw new Error(`cmdPath not found: ${cmdPath}`);
  }
  let relativePath = path.relative(getDir(binPath), cmdPath);
  const isTsFile = relativePath.endsWith('.ts');

  if (isTsFile) {
    relativePath = relativePath.substring(0, relativePath.length - 3);
  }
  const content = [
    `#!/usr/bin/env ${isTsFile ? 'ts-node' : 'node'}`,
    isTsFile ? `import '${relativePath}'` : `require('${relativePath}')`,
    '',
  ].join('\n');
  fs.writeFileSync(binPath, content);
  fs.chmodSync(binPath, '755');
}

export async function generateBinFile() {
  for (const [bin, cmdPath] of Object.entries(BIN_TO_COMMAND)) {
    const tsBinPath = path.join(DIR_PROJECT, 'bin', bin + '.ts');
    const tsCmdPath = path.join(DIR_PROJECT, 'src', cmdPath + '.ts');
    try {
      generateBinContent(tsBinPath, tsCmdPath);
    } catch (err) {
      logColorful({color: 'red'}, err.message);
    }
    const jsBinPath = path.join(DIR_PROJECT, 'bin', bin + '.js');
    const jsCmdPath = path.join(DIR_PROJECT, 'dist', 'src', cmdPath + '.js');
    try {
      generateBinContent(jsBinPath, jsCmdPath);
    } catch (err) {
      logColorful({color: 'red'}, err.message);
    }
  }
}
