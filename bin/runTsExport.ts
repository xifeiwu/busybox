#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import {
  findClosestFile,
  getSpawnConfigByScriptPath,
  spawnTsFile,
  SpawnTsFileOptions,
} from '../modules/lib/node';

const runTsInChildProcess = async (options?: {dryRun?: boolean}) => {
  const {dryRun} = options ?? {};
  /**
   * Format of argv:
   * [
   *   '/Users/wuxifei/.nvm/versions/node/v18.12.0/bin/ts-node',
   *   '/Users/wuxifei/code/bin/runTsExport',
   *   'modules/lib/fe/lib/humanize/test.ts',
   *   'testIntword'
   * ]
   */
  const argv = process.argv;
  const tsFilePath = argv[2];
  const params = argv.length > 2 ? argv.slice(2) : [];
  const tsFileToRun = path.resolve(process.cwd(), tsFilePath);
  const tsFileDir = path.dirname(tsFileToRun);
  const {NVM_BIN} = process.env;
  if (!NVM_BIN) {
    throw new Error(`NVM_BIN not found in process.env`);
  }
  const tsConfigPathsRegister = path.resolve(NVM_BIN, '../lib/node_modules/tsconfig-paths/register.js');
  const tsConfigJson = findClosestFile(tsFileDir, 'tsconfig.json');
  const tsNodeOptions: SpawnTsFileOptions['tsNodeOptions'] = {
    // '--transpileOnly': true,
    '--swc': true,
  };
  if (fs.existsSync(tsConfigPathsRegister)) {
    tsNodeOptions['-r'] = tsConfigPathsRegister;
  }
  if (fs.existsSync(tsConfigJson)) {
    tsNodeOptions['--project'] = tsConfigJson;
  }
  const mainScript = path.resolve(__dirname, '../src/command/runTsExport.ts');
  if (dryRun) {
    const {command, args} = getSpawnConfigByScriptPath(mainScript, {params: [tsFileToRun]});
    console.log(`${command} ${args.join(' ')}`);
    return;
  }
  process.stdin.setRawMode(false);
  const childProcess = spawnTsFile(mainScript, {
    tsNodeOptions,
    printCommand: true,
    params,
    spawnOptions: {stdio: [0, 1, 2]},
  });
  childProcess.on('spawn', () => {
    console.log(`pid of main/child process: ${process.pid}/${childProcess.pid}`);
  });
  childProcess.on('exit', () => {
    // console.log('exit child process');
    process.stdin.setRawMode(true);
    // process.stdin.unpipe(childProcess.stdin);
    // process.stdin.off('data', )
  });
};

runTsInChildProcess();
