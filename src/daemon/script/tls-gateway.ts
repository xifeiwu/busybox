import {HttpRequestInfo, startSocketClient, startSocketServer} from '@src/service/external';
import {out, responseError} from './service';
import {getDefaultHttpsConfig} from '@modules/lib/node';

function route(requestInfo?: HttpRequestInfo) {
  return {
    host: '127.0.0.1',
    port: 80,
  };
}

export async function startTlsGateway() {
  try {
    const {server, host, port} = await startSocketServer(async socket => {
      const {host, port} = route();
      const client = await startSocketClient({host, port});
      socket.pipe(client).pipe(socket);
    }, getDefaultHttpsConfig());
    out({host, port});
  } catch (err) {
    out(responseError(err));
  }
}
startTlsGateway();
