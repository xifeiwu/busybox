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
import {writeDistVersion} from './service';

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

export async function compile() {
  process.chdir(DIR_PROJECT);
  logColorful({color: 'yellow'}, `start compile...`);
  const installNodeModules = await goOnOrNot({
    tips: ['install node_modules?'],
    defaultValue: false,
  });
  /** rm dist dir if install node_modules */
  if (installNodeModules) {
    fs.rmSync(DIR_DIST, {recursive: true});
  }
  execCmdWithOptions('npm run build');
  copyConfigFileToDist();
  /** node_modules can only install once if dependencies in package.json is not */
  if (installNodeModules) {
    installNodeModulesForDistProject();
  }
  writeDistVersion();
  logColorful({color: 'yellow'}, `compile done`);
}
