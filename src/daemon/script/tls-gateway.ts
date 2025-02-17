import fs from 'fs';
import path from 'path';
import {HttpRequestInfo, startSocketClient, startSocketServer} from '@src/service/external';
import {out, responseError} from './service';

function route(requestInfo?: HttpRequestInfo) {
  return {
    host: '127.0.0.1',
    port: 80,
  };
}

export async function start() {
  try {
    const certDir = path.resolve(process.env.HOME, '.ssh/elif.site');
    const {server, host, port} = await startSocketServer(
      async socket => {
        const {host, port} = route();
        const client = await startSocketClient({host, port});
        socket.pipe(client).pipe(socket);
      },
      {
        port: 443,
        options: {
          key: fs.readFileSync(path.join(certDir, 'private.key')),
          cert: fs.readFileSync(path.join(certDir, 'certificate.crt')),
          ca: [fs.readFileSync(path.join(certDir, 'ca_bundle.crt'))],
        },
      }
    );
    out({host, port});
  } catch (err) {
    out(responseError(err));
  }
}
start();
