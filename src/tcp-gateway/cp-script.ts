import {
  Env,
  waitIpcMessageOnce,
  outputInfo,
  getErrorMessage,
  serializeTcpGatewayInfo,
} from '../service/external';
import {startTcpGatewayByEnv} from './server';

interface IpcMessage {
  env: Env;
}

export async function start() {
  const config = await waitIpcMessageOnce<IpcMessage>();
  try {
    const info = await startTcpGatewayByEnv(config);
    const response = serializeTcpGatewayInfo(info);
    outputInfo({...response}, {stdout: true, ipc: true});
  } catch (err) {
    outputInfo(getErrorMessage(err), {stdout: true, ipc: true});
  }
}
start();
