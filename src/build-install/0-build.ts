import fs from 'fs';
import path from 'path';
import {DIR_DIST, DIR_PROJECT} from '../service';
import {
  execCmdWithOptions,
  goOnOrNot,
  isDirExistForFile,
  FilterItem,
  matchFilters,
  logColorful,
  getDir,
} from '../service/external';
import {backupDist, getDistVersion, writeDistVersion} from './service';

/**
 * Copye some config file to dist, to install node_modules by these config file.
 */
function copyConfigFileToDist() {
  /**
   * copy and remove unnecessary dependencies for js project, to reduce size of dist node_modules
   */
  const copyPackageJson = (sourcePath: string, targetPath) => {
    const packageJson = require(sourcePath);
    const ignoreDep: FilterItem[] = ['tsconfig-paths', /^@types\//];
    for (const key of Object.keys(packageJson['dependencies'])) {
      if (matchFilters(ignoreDep, key)) {
        delete packageJson['dependencies'][key];
      }
    }
    const jsonStr = JSON.stringify(packageJson, null, 2);
    fs.writeFileSync(targetPath, jsonStr);
  };
  const keyFilesByDir: Record<string, string[]> = {
    /** .prettierrc will be used for bin command prettier */
    '.': ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.prettierrc'],
    'modules/lib/net': ['package.json'],
    'modules/lib/db': ['package.json'],
    'modules/lib/utils': ['package.json'],
  };
  for (const [folder, fileNameList] of Object.entries(keyFilesByDir)) {
    for (const fileName of fileNameList) {
      const relativePath = path.join(folder, fileName);
      const sourceFullPath = path.join(DIR_PROJECT, relativePath);
      if (!fs.existsSync(sourceFullPath)) {
        throw new Error(`source file not exist: ${sourceFullPath}`);
      }
      const targetFullPath = path.join(DIR_DIST, relativePath);
      /** if dir for targetFullPath not exist, means it's not part of output to dist */
      if (isDirExistForFile(targetFullPath)) {
        if (fileName === 'package.json') {
          copyPackageJson(sourceFullPath, targetFullPath);
        } else {
          fs.copyFileSync(sourceFullPath, targetFullPath);
        }
      }
    }
  }
}
function installNodeModulesForDistProject() {
  process.chdir(DIR_DIST);
  execCmdWithOptions('pnpm install');
}

import {makeSureDirExistForFile} from '../../modules/lib/node/path';
import {BIN_TO_COMMAND} from './config';

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
    `require('${relativePath}');`,
    // isTsFile ? `import '${relativePath}'` : `require('${relativePath}')`,
    '',
  ].join('\n');
  makeSureDirExistForFile(binPath);
  fs.writeFileSync(binPath, content);
  fs.chmodSync(binPath, '755');
}

/**
 * Generate bin file that can run directly by file itself by adding two lines:
 * 1. Add shebang line
 * 2. require the command file
 */
async function generateBinFile() {
  const projectMode = 'ts';
  const binDir = path.join(DIR_PROJECT, 'bin');
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, {recursive: true});
  }
  for (const [bin, cmdInfo] of Object.entries(BIN_TO_COMMAND)) {
    const {filePath: cmdFile, runtime} = cmdInfo;
    /** common logic for ts and js mode */
    const suffix = '.' + projectMode;
    genContentOfBinFile(
      path.join(DIR_PROJECT, 'bin', bin + suffix),
      path.join(DIR_PROJECT, cmdFile + suffix),
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
export async function build(options?: {
  /**
   * When `true` or `false`, that choice wins.
   * When omitted, prompt to backup only if `dist/version.txt` exists.
   */
  backupBeforeCompile?: boolean;
  /**
   * When `true` or `false`, that choice wins.
   * When omitted, prompt whether to remove `dist` before build.
   */
  cleanupDistDir?: boolean;
  /**
   * When `true` or `false`, that choice wins.
   * When omitted, install if dist was cleaned up, else prompt.
   */
  installNodeModules?: boolean;
}) {
  process.chdir(DIR_PROJECT);
  const distVersion = getDistVersion();
  /**
   * Check whether project is compiled or not, before generate bin file.
   */
  if (
    distVersion &&
    !(await goOnOrNot({
      tips: [`current dist version is: ${distVersion}`, 'recompile project or not?'],
      defaultValue: true,
    }))
  ) {
    return;
  }
  /**
   * Backup dist before build
   */
  const shouldBackup =
    typeof options?.backupBeforeCompile === 'boolean'
      ? options.backupBeforeCompile
      : distVersion
        ? await goOnOrNot({
            tips: [`Do you want to backup dist with version ${distVersion}?`],
            defaultValue: false,
          })
        : false;
  if (shouldBackup) {
    backupDist();
  }
  /**
   * Cleanup dist dir before build
   */
  const cleanupDistDir =
    typeof options?.cleanupDistDir === 'boolean'
      ? options.cleanupDistDir
      : await goOnOrNot({
          tips: [`Do you clean up dist dir before build?`],
          defaultValue: false,
        });
  if (cleanupDistDir) {
    fs.rmSync(DIR_DIST, {recursive: true});
  }
  logColorful({color: 'yellow'}, `start build...`);
  execCmdWithOptions('npm run build');
  copyConfigFileToDist();
  /** Should install node_modules when cleanupDistDir is true */
  const installNodeModules =
    typeof options?.installNodeModules === 'boolean'
      ? options.installNodeModules
      : cleanupDistDir ||
        (await goOnOrNot({
          tips: ['install node_modules?'],
          defaultValue: false,
        }));
  /** node_modules can only install once if dependencies in package.json is not */
  if (installNodeModules) {
    logColorful({color: 'yellow'}, `start installNodeModules...`);
    installNodeModulesForDistProject();
  }
  await generateBinFile();
  writeDistVersion();
  logColorful({color: 'yellow'}, `build done`);
}
