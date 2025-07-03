#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import {logColorful} from '../modules/lib/node/log';
import {TsNodeOptions} from '../modules/lib/node/types';
import {getSpawnConfigByScriptPath, spawnScript} from '../modules/lib/node/child-process/spawn';
import {findClosestFile} from '../modules/lib/node/fs/find';

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
  const tsNodeOptions: TsNodeOptions = {
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
  const {childProcess, wholeScript} = spawnScript<TsNodeOptions>(mainScript, {
    runtimeOptions: tsNodeOptions,
    params,
    spawnOptions: {stdio: [0, 1, 2]},
  });

  childProcess.on('spawn', () => {
    logColorful(
      {color: 'yellow'},
      `pid of main/child process: ${process.pid}/${childProcess.pid}`,
      wholeScript
    );
  });
  childProcess.on('exit', () => {
    // console.log('exit child process');
    process.stdin.setRawMode(true);
    // process.stdin.unpipe(childProcess.stdin);
    // process.stdin.off('data', )
  });
};

runTsInChildProcess();
