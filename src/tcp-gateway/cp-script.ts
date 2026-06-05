import {
  startSocketClient,
  startSocketServer,
  getDefaultHttpsConfig,
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

function route() {
  return {
    host: '127.0.0.1',
    port: 80,
  };
}

export async function startTlsGateway(config?: IpcMessage) {
  try {
    const {server, host, port} = await startSocketServer(async socket => {
      const {host, port} = route();
      const client = await startSocketClient({host, port});
      socket.pipe(client).pipe(socket);
    }, getDefaultHttpsConfig(config));
    return {host, port};
  } catch (err) {
    return err.message;
  }
}

export async function start() {
  const config = await waitIpcMessageOnce<IpcMessage>();
  try {
    const info = await startTcpGatewayByEnv(config);
    const response = serializeTcpGatewayInfo(info);
    const tlsInfo = await startTlsGateway(config);
    outputInfo({...response, tlsInfo}, {stdout: true, ipc: true});
  } catch (err) {
    outputInfo(getErrorMessage(err), {stdout: true, ipc: true});
  }
}
start();
/**
 * In order to save resource cost on elif.site, startTlsGateway in the same process.
 */
