#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {
  findClosestFile,
  spawnScript,
  getSpawnConfigByScriptPath,
  logColorful,
  TsNodeOptions,
} from '@modules/lib/node';

const program = new Command();
program.name('runTsExport').description('utility for process handling');
program
  .argument('<tsFilePath>', 'path to ts file to run')
  // .argument('[funcName]', 'name of function')
  .option('-d, --dry-run', 'show the command without running it. ')
  .action(async (tsFilePath, options) => {
    const {dryRun} = options ?? {};
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
    const tsNodeOptions: TsNodeOptions = {
      '--transpileOnly': true,
    };
    if (fs.existsSync(tsConfigPathsRegister)) {
      tsNodeOptions['-r'] = tsConfigPathsRegister;
    }
    if (fs.existsSync(tsConfigJson)) {
      tsNodeOptions['--project'] = tsConfigJson;
    }
    if (dryRun) {
      const {command, args} = getSpawnConfigByScriptPath(tsFileToRun);
      console.log(`${command} ${args.join(' ')}`);
      return;
    }
    // const tsConfigPathsRegister = path.resolve(NVM_BIN, '../lib/node_modules/tsconfig-paths/register.js');
    // const tsConfigJson = findClosestFile(tsFileDir, 'tsconfig.json');
    process.stdin.setRawMode(false);
    const {childProcess, wholeScript} = spawnScript<TsNodeOptions>(tsFileToRun, {
      runtimeOptions: tsNodeOptions,
      params,
      spawnOptions: {stdio: ['pipe', 1, 2]},
    });
    childProcess.on('spawn', () => {
      logColorful(
        {color: 'yellow'},
        `pid of main/child process: ${process.pid}/${childProcess.pid}`,
        wholeScript
      );
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
