#!/usr/bin/env ts-node
import path from 'path';
import {Command} from 'commander';
import {findClosestFile, spawnTsFile} from '../modules/lib/node';

const program = new Command();
program.name('runTsExport').description('utility for process handling');
program
  .argument('<tsFilePath>', 'path to ts file to run')
  .argument('[funcName]', 'name of function')
  .option('-p, --print', 'print process info or not')
  .action(async (tsFilePath, options) => {
    /**
     * Format of argv:
     * [
     *   '/Users/wuxifei/.nvm/versions/node/v18.12.0/bin/ts-node',
     *   '/Users/wuxifei/code/bin/runTs',
     *   'modules/lib/fe/lib/humanize/test.ts',
     *   'testIntword'
     * ]
     */
    const argv = process.argv;
    const params = argv.length > 2 ? argv.slice(2) : [];
    const tsFileToRun = path.resolve(process.cwd(), tsFilePath);
    const tsFileDir = path.dirname(tsFileToRun);

    const {NVM_BIN} = process.env;
    if (!NVM_BIN) {
      throw new Error(`NVM_BIN not found in process.env`);
    }
    const tsConfigPathsRegister = path.resolve(NVM_BIN, '../lib/node_modules/tsconfig-paths/register.js');
    const tsConfigJson = findClosestFile(tsFileDir, 'tsconfig.json');
    process.stdin.setRawMode(false);
    const childProcess = spawnTsFile(tsFileToRun, {
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
