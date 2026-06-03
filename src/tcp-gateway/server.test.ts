import path from 'path';
import {serializeTcpGatewayInfo, startTcpGatewayByDefaultConfig, startTcpGatewayByEnv} from './server';
import {logColorful, Env} from '@src/service/external';

export async function testStartTcpGatewayByEnv() {
  const env: Env = (process.env.NODE_ENV ?? Env.local) as Env;
  const uploadDir = path.resolve(__dirname, 'uploads');
  const staticDir = undefined;
  // const tcpPort = 3161;
  const info = await startTcpGatewayByEnv({
    env,
    staticDir: staticDir ? path.resolve(process.cwd(), staticDir) : undefined,
    uploadDir,
    // port: tcpPort,
  });
  logColorful({}, serializeTcpGatewayInfo(info));
}

export async function testStartTcpGatewayDefaultConfig() {
  const info = await startTcpGatewayByDefaultConfig({
    staticDir: '/Users/xfwu/Documents/jingyuexing.github.io',
  });
  logColorful({}, serializeTcpGatewayInfo(info));
}
