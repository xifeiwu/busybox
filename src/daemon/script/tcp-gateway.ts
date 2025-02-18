import {
  HttpRequestInfo,
  InfoToCp,
  startSocketClient,
  startSocketServer,
  getDefaultHttpsConfig,
} from '@src/service/external';
import {serializeTcpGatewayInfo, startTcpGatewayByOptions} from '@src/tcp-gateway';
import {TcpGateWayOptions} from '@src/types';
import {out, responseError} from './service';

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
    out({host, port});
  } catch (err) {
    out(responseError(err));
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
    const info = await startTcpGatewayByOptions(config);
    const response = serializeTcpGatewayInfo(info);
    await startTlsGateway(config);
    out(response);
  } catch (err) {
    out(responseError(err));
  }
}
start();
/**
 * In order to save resource cost on elif.site, startTlsGateway in the same process.
 */
