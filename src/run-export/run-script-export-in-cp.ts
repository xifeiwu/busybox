import path from 'path';
import {logColorful} from '../../modules/lib/node/log';
import {TsNodeOptions} from '../../modules/lib/node/types';
import {getFilePathInfo} from '../../modules/lib/node/path';
import {
  getSpawnConfigByScriptPath,
  spawnAndTryIpc,
  serializeSpawnResponse,
} from '../../modules/lib/node/child-process/spawn';
import {tryUseJsFile} from '../../modules/lib/node/child-process/service';
import {RunScriptExportInCPOptions} from './types';

const defaultTsNodeOptions: TsNodeOptions = {
  // '--transpileOnly': true,
  '--swc': true,
  '-r': null,
  '--project': null,
};
export async function runScriptExportInCP(targetScript: string, options?: RunScriptExportInCPOptions) {
  const {dryRun, spawnOptions, tsNodeOptions, funcOptions} = options ?? {};

  const {extname} = getFilePathInfo(targetScript);
  if (!['.ts', '.js'].includes(extname)) {
    throw new Error(`Can only run .ts or .js script`);
  }
  const targetIsTsFile = extname === '.ts';

  const mainScript = tryUseJsFile(path.join(__dirname, 'cp-script.ts'));
  /**
   * get command and args by targetScript:
   * command: ts-node
   * args: [-r, node/start/feature/node_modules/tsconfig-paths/register.js, --project, node/start/feature/tsconfig.json, --swc, /Users/wuxifei/code/node/start/feature/1-js/object/defineProperty/get-set.ts]
   */
  const spawnAndIpcConfig = getSpawnConfigByScriptPath<TsNodeOptions>(targetScript, {
    runtimeOptions: targetIsTsFile ? tsNodeOptions ?? defaultTsNodeOptions : {},
  });
  const {command, args} = spawnAndIpcConfig;
  /**
   * targetScript     mainScript        runtime
   * .ts              .ts               ts-node
   * .ts              .js               ts-node
   * .js              .ts               ts-node
   * .js              .js               node
   */
  const finalCommand = getFilePathInfo(mainScript).extname === '.ts' ? 'ts-node' : command;
  const finalArgs = [...args];
  finalArgs.splice(args.length - 1, 0, mainScript);

  const wholeScript = [finalCommand, ...finalArgs, funcOptions?.funcName, ...(funcOptions?.funcParams ?? [])]
    .filter(Boolean)
    .join(' ');
  logColorful({color: 'magenta'}, wholeScript);
  if (dryRun) {
    return;
  }

  process.stdin.setRawMode(false);
  const response = await spawnAndTryIpc({
    command: finalCommand,
    args: finalArgs,
    spawnOptions: {
      ...spawnOptions,
      stdio: [0, 1, 2, 'ipc'],
    },
    infoToCp: {
      config: [targetScript, funcOptions],
    },
    maxWaitTime4Ipc: 30,
  });
  const {childProcess} = response;
  logColorful({color: 'magenta'}, `pid of main/child process: ${process.pid}/${childProcess.pid}`);

  childProcess.on('exit', () => {
    // console.log('exit child process');
    process.stdin.setRawMode(true);
    // process.stdin.unpipe(childProcess.stdin);
    // process.stdin.off('data', )
  });
  return serializeSpawnResponse(response);
}
