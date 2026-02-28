import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {execSync, exec} from 'child_process';
import {DIR_PROJECT} from '../service/config';
import {logColorful} from '../../modules/lib/node/log';
import {getFilePathInfo} from '../../modules/lib/node/path';
import {goOnOrNot} from '../../modules/lib/node/readline';
import {findClosestFile, getFileList} from '../../modules/lib/node/fs';

function findPrettierBin() {
  const nodePath = execSync(`which node`).toString().trim();
  const possiblePaths = [
    path.join(nodePath, '../prettier'),
    path.join(nodePath, '../../lib/node_modules/prettier/bin/prettier.cjs'),
  ];
  const prettierBinPath = possiblePaths.find(it => fs.existsSync(it));
  if (!prettierBinPath) {
    throw new Error(`Please install prettier first: npm install -g prettier`);
  }
  return prettierBinPath;
}

async function runPrettier(options: {target: string[]; configPath: string}) {
  const {target, configPath = path.join(DIR_PROJECT, '.prettierrc')} = options;
  const existedFiles = target.filter(it => fs.existsSync(it));
  if (existedFiles.length !== target.length) {
    logColorful({color: 'red'}, `Ignore ${target.length - existedFiles.length} files as they are not exist`);
  }
  if (existedFiles.length === 0) {
    return;
  }
  const prettierBinPath = findPrettierBin();
  const command = [prettierBinPath, '--write', '--config', configPath, existedFiles.join(' ')].join(' ');
  // logColorful({color: 'yellow'}, command);
  if (
    !(await goOnOrNot({
      tips: [command, `Do you want to run this command?`],
      defaultValue: true,
    }))
  ) {
    return;
  }

  const childProcess = exec(command);
  childProcess.stdout.on('data', data => {
    console.log(data.toString());
  });
  childProcess.stderr.on('data', data => {
    console.error(data.toString());
  });
}

function fileFilter({relativePath}: {relativePath: string}) {
  const {extname} = getFilePathInfo(relativePath);
  return ['.js', '.ts', '.jsx', '.tsx'].includes(extname);
}

/**
 * return full path
 * @param target
 * @returns
 */
function getGitChangedFiles(target: string) {
  const fullTargetPath = path.resolve(process.cwd(), target);
  if (!fs.existsSync(fullTargetPath)) {
    throw new Error(`target file or dir not found: ${fullTargetPath}`);
  }
  const changedFiles = [
    /** list file changed in cache */
    'git diff --cached  --name-only',
    /** list files changed */
    `git diff --name-only --diff-filter=d`,
    /** list files not traced by git */
    'git ls-files --others  --exclude-standard',
  ]
    .map(it => execSync(it).toString().trim().split('\n'))
    .flat();
  const gitRepoDir = execSync(`git rev-parse --show-toplevel`).toString().replace(/\n$/, '');
  return changedFiles.filter(it => fileFilter({relativePath: it})).map(it => path.join(gitRepoDir, it));
}

function tryFindPrettierrc(target: string) {
  const config =
    findClosestFile(target, '.prettierrc') ||
    findClosestFile(target, '.prettierrc.js') ||
    path.join(DIR_PROJECT, '.prettierrc');
  return config;
}
const program = new Command();
program
  .argument('[target]', 'target file or dir to format')
  .option('-c, --config <config>', 'env to run this command: local | elif')
  .action(async (target, options) => {
    const fullTargetPath = path.resolve(process.cwd(), target ?? '.');
    const config = options?.config ?? tryFindPrettierrc(fullTargetPath);
    if (target === undefined) {
      const changedFiles = getGitChangedFiles(fullTargetPath);
      runPrettier({target: changedFiles.map(it => path.resolve(fullTargetPath, it)), configPath: config});
      return;
    }
    const stat = fs.statSync(fullTargetPath);
    if (stat.isFile()) {
      runPrettier({target: [fullTargetPath], configPath: config});
    } else if (stat.isDirectory()) {
      const files = getFileList(fullTargetPath, {
        includeDir: true,
        fileFilter,
      });
      runPrettier({target: files.map(it => path.resolve(fullTargetPath, it)), configPath: config});
    } else {
      throw new Error(`target is not a file or dir: ${fullTargetPath}`);
    }
  });
program.parse(process.argv);
