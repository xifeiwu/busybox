import path from 'path';
import fs from 'fs';
import {DIR_PROJECT} from '../service';
import {logColorful, getDir} from '../service/external';
import {BIN_TO_COMMAND} from './config';

function generateBinContent(binPath: string, cmdPath: string, runtime: string) {
  if (!fs.existsSync(cmdPath)) {
    throw new Error(`cmdPath not found: ${cmdPath}`);
  }
  let relativePath = path.relative(getDir(binPath), cmdPath);
  const isTsFile = relativePath.endsWith('.ts');

  /** Not need .ts suffix when import file */
  if (isTsFile) {
    relativePath = relativePath.substring(0, relativePath.length - 3);
  }
  const finalRunTime = runtime ?? (isTsFile ? 'ts-node' : 'node');
  const content = [
    `#!/usr/bin/env ${finalRunTime}`,
    isTsFile ? `import '${relativePath}'` : `require('${relativePath}')`,
    '',
  ].join('\n');
  fs.writeFileSync(binPath, content);
  fs.chmodSync(binPath, '755');
}

export async function generateBinFile() {
  for (const [bin, cmdInfo] of Object.entries(BIN_TO_COMMAND)) {
    const {filePath: cmdFile, runtime} = cmdInfo;
    generateBinContent(
      path.join(DIR_PROJECT, 'bin', bin + '.ts'),
      path.join(DIR_PROJECT, 'src', cmdFile + '.ts'),
      runtime
    );
    generateBinContent(
      path.join(DIR_PROJECT, 'bin', bin + '.js'),
      path.join(DIR_PROJECT, 'dist', 'src', cmdFile + '.js'),
      runtime
    );
  }
}
