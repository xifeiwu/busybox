#!/usr/bin/env ts-node --transpileOnly
import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {SpawnTsFileOptions, findClosestFile, spawnTsFile} from '../modules/lib/node';

const program = new Command();
program.name('runTsExport').description('utility for process handling');
program
  .argument('<tsFilePath>', 'path to ts file to run')
  // .argument('[funcName]', 'name of function')
  .option('-p, --print', 'print process info or not')
  .action(async (tsFilePath, options) => {
    /**
     * Format of argv:
     * [
     *   '/Users/wuxifei/.nvm/versions/node/v18.12.0/bin/ts-node',
     *   '/Users/wuxifei/code/bin/runOnTsNode',
     *   'tsfileToExec.ts',
     *   'params for tsfileToExec'
     * ]
     */
    const argv = process.argv;
    const params = argv.length > 3 ? argv.slice(3) : [];
    const tsFileToRun = path.resolve(process.cwd(), tsFilePath);
    const tsFileDir = path.dirname(tsFileToRun);

    const {NVM_BIN} = process.env;
    if (!NVM_BIN) {
      throw new Error(`NVM_BIN not found in process.env`);
    }
    const tsConfigPathsRegister = path.resolve(NVM_BIN, '../lib/node_modules/tsconfig-paths/register.js');
    const tsConfigJson = findClosestFile(tsFileDir, 'tsconfig.json');
    const tsNodeOptions: SpawnTsFileOptions['tsNodeOptions'] = {
      '--transpileOnly': true,
    };
    if (fs.existsSync(tsConfigPathsRegister)) {
      tsNodeOptions['-r'] = tsConfigPathsRegister;
    }
    if (fs.existsSync(tsConfigJson)) {
      tsNodeOptions['--project'] = tsConfigJson;
    }
    // const tsConfigPathsRegister = path.resolve(NVM_BIN, '../lib/node_modules/tsconfig-paths/register.js');
    // const tsConfigJson = findClosestFile(tsFileDir, 'tsconfig.json');
    process.stdin.setRawMode(false);
    const childProcess = spawnTsFile(tsFileToRun, {
      tsNodeOptions,
      printCommand: true,
      params,
      spawnOptions: {stdio: ['pipe', 1, 2]},
    });
    childProcess.on('spawn', () => {
      console.log(`pid of main/child process: ${process.pid}/${childProcess.pid}`);
    });
    process.stdin.pipe(childProcess.stdin);
    process.stdin.on('data', chunk => {
      // console.log(chunk);
    });
    childProcess.on('exit', () => {
      process.stdin.setRawMode(true);
    });
  });
program.parse(process.argv);
