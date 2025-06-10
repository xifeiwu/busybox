#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {
  findClosestFile,
  getSpawnConfigByScriptPath,
  spawnTsFile,
  SpawnTsFileOptions,
} from '../modules/lib/node';

/**
 * NOTICE: the params used by Command should be the same as params used in ../src/command/runTsExport.ts
 */
const program = new Command();
program.name('runTsExport').description('utility for process handling');
program
  .argument('<tsFilePath>', 'path to ts file to run')
  .argument('[funcName]', 'name of function')
  .argument('[funcParams...]', 'params passed to the function')
  .option('-a, --all', 'run all exported function')
  .option('-d, --dry-run', 'show the command without running it. ')
  .action(async (tsFilePath, funcName, funcParams, options) => {
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
    // process.stdin.pipe(childProcess.stdin);
    // process.stdin.on('data', chunk => {
    // });
    childProcess.on('exit', () => {
      // console.log('exit child process');
      process.stdin.setRawMode(true);
      // process.stdin.unpipe(childProcess.stdin);
      // process.stdin.off('data', )
    });
  });
program.parse(process.argv);
