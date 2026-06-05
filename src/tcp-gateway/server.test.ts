import path from 'path';
import {startTcpGatewayByDefaultConfig, startTcpGatewayByEnv} from './server';
import {logColorful, Env, serializeTcpGatewayInfo} from '../service/external';

export async function testStartTcpGatewayByEnv() {
  const env: Env = (process.env.NODE_ENV ?? Env.local) as Env;
  const info = await startTcpGatewayByEnv({
    env,
  });
  logColorful({}, serializeTcpGatewayInfo(info));
}

export async function testStartTcpGatewayDefaultConfig() {
  const uploadDir = path.resolve(__dirname, 'uploads');
  const staticDir = '/Users/xfwu/Documents/jingyuexing.github.io';
  const info = await startTcpGatewayByDefaultConfig({
    koa: {
      staticDir,
      uploadDir,
    },
    gateway: {
      port: 3161,
    },
  });
  logColorful({}, serializeTcpGatewayInfo(info));
}
