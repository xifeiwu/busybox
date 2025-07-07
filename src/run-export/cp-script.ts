import {runScriptExport} from '../../modules/lib/node/utils/run-script-export';
import {InfoToCp} from '../../modules/lib/node/types/child_process';
import {RunScriptExportConfig} from './types';
import {logColorful} from '../../modules/lib/node/log';

const TAG = 'OUT_OF_FUNCTION';

export async function start() {
  let ipcMessage: InfoToCp<RunScriptExportConfig> = {};
  if (process.send) {
    ipcMessage = await new Promise<InfoToCp<RunScriptExportConfig>>(res => {
      process.once('message', (chunk: InfoToCp<RunScriptExportConfig>) => {
        res(chunk);
      });
      /** Wait message for one second at most */
      setTimeout(() => {
        res({});
      }, 1000);
    });
  }
  const {config} = ipcMessage;
  const {scriptPath, ...options} = config;

  if (process.connected && process.send) {
    /** Child process will exit by the error EPipe if the error is not catched here */
    process.send(
      `start run command in child process: ${[scriptPath, options?.funcName, ...(options?.funcParams ?? [])]
        .filter(Boolean)
        .join(' ')}`
    );
  }

  try {
    const result = await runScriptExport(scriptPath, options);
    console.log('');
    console.log(TAG);
    console.log(result);
    console.log('------');
  } catch (err) {
    console.log(`${TAG} catch Error:`);
    logColorful({color: 'red'}, err.message);
    console.error(err);
    throw err;
  }
}
start();
