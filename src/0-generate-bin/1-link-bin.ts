import fs from 'fs';
import path from 'path';
import {logColorful, selectOption, linkFile as link, getDir} from '../service/external';
import {BIN_TO_COMMAND} from './config';
import {GenerateOptions} from './service';
import {DIR_DIST} from '../service';

const PROJECT_DIR_RELATIVE_PATH = path.join(__dirname, '../../');

function genContentOfBinFile(binPath: string, cmdPath: string, runtime: string) {
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
export async function generateBinFile(options?: GenerateOptions) {
  const {projectMode = 'ts'} = options ?? {};
  const binDir = path.join(PROJECT_DIR_RELATIVE_PATH, 'bin');
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, {recursive: true});
  }
  for (const [bin, cmdInfo] of Object.entries(BIN_TO_COMMAND)) {
    const {filePath: cmdFile, runtime} = cmdInfo;
    /** common logic for ts and js mode */
    const suffix = '.' + projectMode;
    genContentOfBinFile(
      path.join(PROJECT_DIR_RELATIVE_PATH, 'bin', bin + suffix),
      path.join(PROJECT_DIR_RELATIVE_PATH, cmdFile + suffix),
      runtime
    );
    if (projectMode === 'ts') {
      /** should also generate .js bin in tsMode */
      genContentOfBinFile(
        path.join(DIR_DIST, 'bin', bin + '.js'),
        path.join(DIR_DIST, cmdFile + '.js'),
        runtime
      );
    }
  }
}

export async function linkBin(linkDir: string, options?: GenerateOptions) {
  const {projectMode = 'ts'} = options ?? {};
  const projectBinDir = path.join(PROJECT_DIR_RELATIVE_PATH, 'bin');
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
    const linkFile = path.resolve(linkDir, binName);
    const binFile = path.join(binDir, binName + suffix);
    link(binFile, linkFile);
    logColorful({color: 'green'}, `Created Link: ${linkFile} -> ${binFile}`);
  }
  logColorful({color: 'red'}, `export PATH=${linkDir}:$PATH`);
}
