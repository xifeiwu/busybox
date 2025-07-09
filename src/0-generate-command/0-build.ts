import fs from 'fs';
import path from 'path';
import {DIR_JS_DIST, DIR_PROJECT} from '../service';
import {logCmdAndexecSync, goOnOrNot, isDirExistForFile, toLocalISOString} from '../service/external';

const keyFilesByDir: Record<string, string[]> = {
  '.': ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'],
  'modules/lib/net': ['package.json'],
  'modules/lib/db': ['package.json'],
  'modules/lib/utils': ['package.json'],
};

function copyKeyFileToDist() {
  for (const [folder, fileNameList] of Object.entries(keyFilesByDir)) {
    for (const fileName of fileNameList) {
      const relativePath = path.join(folder, fileName);
      const targetFullPath = path.join(DIR_JS_DIST, relativePath);
      if (isDirExistForFile(targetFullPath)) {
        fs.copyFileSync(path.join(DIR_PROJECT, relativePath), targetFullPath);
      }
    }
  }
}
function installNodeModulesInDist() {
  process.chdir(DIR_JS_DIST);
  logCmdAndexecSync('pnpm install');
}

function writeVersionFile() {
  fs.writeFileSync(path.join(DIR_JS_DIST, 'version.txt'), toLocalISOString());
}

export async function buildJs() {
  process.chdir(DIR_PROJECT);
  const installNodeModules = await goOnOrNot({
    tips: ['install node_modules'],
    defaultValue: false,
  });
  /** rm dist dir if install node_modules */
  if (installNodeModules) {
    fs.rmSync(DIR_JS_DIST, {recursive: true});
  }
  logCmdAndexecSync('npm run build');
  copyKeyFileToDist();
  /** node_modules can only install once if dependencies in package.json is not */
  if (installNodeModules) {
    installNodeModulesInDist();
  }
  writeVersionFile();
}
