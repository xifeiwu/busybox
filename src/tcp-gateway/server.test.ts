import path from 'path';
import {Env} from '@src/types';
import {serializeTcpGatewayInfo, startTcpGatewayByOptions} from './server';
import {logColorful} from '@src/service/external';

export async function testStartTcpGatewayByOptions() {
  const env: Env = (process.env.HOME ?? 'local') as Env;
  const uploadDir = path.resolve(__dirname, 'uploads');
  const staticDir = undefined;
  const tcpPort = 3161;
  const info = await startTcpGatewayByOptions({
    env,
    staticDir: staticDir ? path.resolve(process.cwd(), staticDir) : undefined,
    uploadDir,
    port: tcpPort,
  });
  logColorful({}, serializeTcpGatewayInfo(info));
}
