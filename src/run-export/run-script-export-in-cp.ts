import path from 'path';
import {logColorful} from '../../modules/lib/node/log';
import {TsNodeOptions} from '../../modules/lib/node/types';
import {getFilePathInfo} from '../../modules/lib/node/path';
import {
  getSpawnAndTryIpcConfigByScriptPath,
  spawnAndTryIpc,
  serializeSpawnResponse,
} from '../../modules/lib/node/child-process/spawn';
import {tryUseJsFile} from '../../modules/lib/node/child-process/service';
import {RunScriptExportConfig, RunScriptExportInCPOptions} from './types';

export async function runScriptExportInCP(targetScript: string, options?: RunScriptExportInCPOptions) {
  const {dryRun, ...restOptions} = options ?? {};

  const {extname} = getFilePathInfo(targetScript);
  if (!['.ts', '.js'].includes(extname)) {
    throw new Error(`Can only run .ts or .js script`);
  }
  const targetIsTsFile = extname === '.ts';

  const tsNodeOptions: TsNodeOptions = {
    // '--transpileOnly': true,
    '--swc': true,
    '-r': null,
    '--project': null,
  };
  const spawnConfig = getSpawnAndTryIpcConfigByScriptPath<RunScriptExportConfig>(targetScript, {
    runtimeOptions: targetIsTsFile ? tsNodeOptions : {},
    infoToCp: {
      config: {
        scriptPath: targetScript,
        ...restOptions,
      },
    },
    maxWaitTime4Ipc: 30,
  });
  const {command, args} = spawnConfig;
  const mainScript = tryUseJsFile(path.join(__dirname, 'cp-script.ts'));
  /**
   * targetScript     mainScript        runtime
   * .ts              .ts               ts-node
   * .ts              .js               ts-node
   * .js              .ts               ts-node
   * .js              .js               node
   */
  const finalCommand = getFilePathInfo(mainScript).extname === '.ts' ? 'ts-node' : command;
  const finalArgs = [mainScript, ...args];

  const wholeScript = `${finalCommand} ${finalArgs.join(' ')}`;
  logColorful({color: 'magenta'}, wholeScript);
  if (dryRun) {
    return;
  }

  process.stdin.setRawMode(false);
  const response = await spawnAndTryIpc({
    ...spawnConfig,
    command: finalCommand,
    args: finalArgs,
    spawnOptions: {
      stdio: [0, 1, 2, 'ipc'],
    },
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
