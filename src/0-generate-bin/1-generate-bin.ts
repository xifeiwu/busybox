import path from 'path';
import fs from 'fs';
import {DIR_JS_DIST, DIR_PROJECT} from '../service';
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
    `require('${relativePath}')`,
    // isTsFile ? `import '${relativePath}'` : `require('${relativePath}')`,
    '',
  ].join('\n');
  fs.writeFileSync(binPath, content);
  fs.chmodSync(binPath, '755');
}

/**
 * Generate bin file that can run directly by file itself by adding two lines:
 * 1. Add shebang line
 * 2. require the command file
 */
export async function generateBinFile() {
  for (const [bin, cmdInfo] of Object.entries(BIN_TO_COMMAND)) {
    const {filePath: cmdFile, runtime} = cmdInfo;
    /** generate bin file that run .ts command on host project*/
    generateBinContent(
      path.join(DIR_PROJECT, 'bin', bin + '.ts'),
      path.join(DIR_PROJECT, 'src', cmdFile + '.ts'),
      runtime
    );
    /** generate bin file that run .js command on host project */
    generateBinContent(
      path.join(DIR_PROJECT, 'bin', bin + '.js'),
      path.join(DIR_JS_DIST, 'src', cmdFile + '.js'),
      runtime
    );
    /** generate bin file that run .js command on dist project */
    generateBinContent(
      path.join(DIR_JS_DIST, 'bin', bin + '.js'),
      path.join(DIR_JS_DIST, 'src', cmdFile + '.js'),
      runtime
    );
  }
}
