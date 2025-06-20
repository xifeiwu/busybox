import path from 'path';
import {Env} from '@src/service/external';
import {startTcpGatewayByOptionsAndPrintInfo} from './tcp-gateway';

export async function testStartTcpGatewayByOptions() {
  const env: Env = (process.env.NODE_ENV ?? Env.local) as Env;
  const uploadDir = path.resolve(__dirname, 'uploads');
  const staticDir = undefined;
  await startTcpGatewayByOptionsAndPrintInfo(
    {
      env,
      // staticDir,
      uploadDir,
      // port: tcpPort,
    },
    staticDir
  );
}
