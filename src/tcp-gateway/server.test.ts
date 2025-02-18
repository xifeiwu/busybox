import path from 'path';
import {serializeTcpGatewayInfo, startTcpGatewayByOptions} from './server';
import {logColorful, Env} from '@src/service/external';

export async function testStartTcpGatewayByOptions() {
  const env: Env = (process.env.NODE_ENV ?? Env.local) as Env;
  const uploadDir = path.resolve(__dirname, 'uploads');
  const staticDir = undefined;
  // const tcpPort = 3161;
  const info = await startTcpGatewayByOptions({
    env,
    staticDir: staticDir ? path.resolve(process.cwd(), staticDir) : undefined,
    uploadDir,
    // port: tcpPort,
  });
  logColorful({}, serializeTcpGatewayInfo(info));
}
