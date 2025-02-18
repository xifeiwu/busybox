import {HttpRequestInfo, startSocketClient, startSocketServer} from '@src/service/external';
import {out, responseError} from './service';
import {getDefaultHttpsConfig} from '@modules/lib/node';
import {TcpGateWayOptions} from '@src/types';

function route(requestInfo?: HttpRequestInfo) {
  return {
    host: '127.0.0.1',
    port: 80,
  };
}

/**
 * NOTICE: not stable
 * @param config
 */
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
