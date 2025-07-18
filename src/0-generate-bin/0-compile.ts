import fs from 'fs';
import path from 'path';
import {DIR_DIST, DIR_PROJECT} from '../service';
import {
  logCmdAndexecSync,
  goOnOrNot,
  isDirExistForFile,
  getDir,
  FilterItem,
  matchFilters,
} from '../service/external';
import {BIN_TO_COMMAND, writeDistVersion} from './service';

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
  logCmdAndexecSync('pnpm install');
}

/**
 * Generate bin file that can run directly by file itself by adding two lines:
 * 1. Add shebang line
 * 2. require the command file
 */
export async function generateBinFile() {
  const generateContent = (binPath: string, cmdPath: string, runtime: string) => {
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
  };

  const distBinDir = path.join(DIR_DIST, 'bin');
  if (!fs.existsSync(distBinDir)) {
    fs.mkdirSync(distBinDir, {recursive: true});
  }
  for (const [bin, cmdInfo] of Object.entries(BIN_TO_COMMAND)) {
    const {filePath: cmdFile, runtime} = cmdInfo;
    /** generate bin file that run .ts command on host project*/
    generateContent(
      path.join(DIR_PROJECT, 'bin', bin + '.ts'),
      path.join(DIR_PROJECT, 'src', cmdFile + '.ts'),
      runtime
    );
    /** generate bin file that run .js command on host project */
    generateContent(
      path.join(DIR_PROJECT, 'bin', bin + '.js'),
      path.join(DIR_DIST, 'src', cmdFile + '.js'),
      runtime
    );
    /** generate bin file that run .js command on dist project */
    generateContent(
      path.join(DIR_DIST, 'bin', bin + '.js'),
      path.join(DIR_DIST, 'src', cmdFile + '.js'),
      runtime
    );
  }
}

export async function compile() {
  process.chdir(DIR_PROJECT);
  const installNodeModules = await goOnOrNot({
    tips: ['install node_modules?'],
    defaultValue: false,
  });
  /** rm dist dir if install node_modules */
  if (installNodeModules) {
    fs.rmSync(DIR_DIST, {recursive: true});
  }
  logCmdAndexecSync('npm run build');
  copyConfigFileToDist();
  /** node_modules can only install once if dependencies in package.json is not */
  if (installNodeModules) {
    installNodeModulesForDistProject();
  }
  writeDistVersion();
  generateBinFile();
}
