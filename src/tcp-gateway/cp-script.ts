import {
  HttpRequestInfo,
  startSocketClient,
  startSocketServer,
  getDefaultHttpsConfig,
  Env,
  waitIpcMessageOnce,
} from '../service/external';
import {serializeTcpGatewayInfo, startTcpGatewayByEnv} from '@src/tcp-gateway';
import {out, responseError} from '../2-cp-script/service';

interface IpcMessage {
  env: Env;
}

function route(requestInfo?: HttpRequestInfo) {
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
    out({...response, tlsInfo});
  } catch (err) {
    out(responseError(err));
  }
}
start();
/**
 * In order to save resource cost on elif.site, startTlsGateway in the same process.
 */
