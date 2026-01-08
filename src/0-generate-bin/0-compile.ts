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
    '.': ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'],
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

export async function compile(options?: {
  /** backup before compile to avoid stble logic override by unstable logic */
  backupBeforeCompile?: boolean;
  cleanupDistDir?: boolean;
  installNodeModules?: boolean;
}) {
  process.chdir(DIR_PROJECT);
  const distVersion = getDistVersion();
  const backupBeforeCompile =
    options?.backupBeforeCompile ??
    (distVersion &&
      (await goOnOrNot({
        tips: [`Do you want to backup dist with version ${distVersion}?`],
        defaultValue: false,
      })));
  if (backupBeforeCompile) {
    backupDist();
  }
  const cleanupDistDir =
    options?.cleanupDistDir ??
    (await goOnOrNot({
      tips: [`Do you clean up dist dir before compile?`],
      defaultValue: false,
    }));
  if (cleanupDistDir) {
    fs.rmSync(DIR_DIST, {recursive: true});
  }
  logColorful({color: 'yellow'}, `start compile...`);
  execCmdWithOptions('npm run build');
  copyConfigFileToDist();
  /** Should install node_modules when cleanupDistDir is true */
  const installNodeModules =
    options?.installNodeModules ??
    (cleanupDistDir ||
      (await goOnOrNot({
        tips: ['install node_modules?'],
        defaultValue: false,
      })));
  /** node_modules can only install once if dependencies in package.json is not */
  if (installNodeModules) {
    logColorful({color: 'yellow'}, `start installNodeModules...`);
    installNodeModulesForDistProject();
  }
  writeDistVersion();
  logColorful({color: 'yellow'}, `compile done`);
}
