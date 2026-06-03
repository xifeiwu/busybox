import {
  HttpRequestInfo,
  InfoToCp,
  startSocketClient,
  startSocketServer,
  getDefaultHttpsConfig,
} from '@src/service/external';
import {serializeTcpGatewayInfo, startTcpGatewayByEnv} from '@src/tcp-gateway';
import {TcpGateWayOptions} from '@src/types';
import {out, responseError} from '../2-cp-script/service';

function route(requestInfo?: HttpRequestInfo) {
  return {
    host: '127.0.0.1',
    port: 80,
  };
}

export async function startTlsGateway(config: TcpGateWayOptions) {
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
  let ipcMessage: InfoToCp<TcpGateWayOptions> = {};
  if (process.send) {
    ipcMessage = await new Promise<InfoToCp<TcpGateWayOptions>>(res => {
      process.once('message', (chunk: InfoToCp<TcpGateWayOptions>) => {
        res(chunk);
      });
      /** Wait message for one second at most */
      setTimeout(() => {
        res({});
      }, 1000);
    });
  }
  const {config = {}} = ipcMessage;
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
