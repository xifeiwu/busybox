/**
 * A basic server contains frequently used function
 */
import {
  startCustomizedTcpGateway,
  KoaShortCutConfig,
  Env,
  serializeTcpGatewayConfig,
} from '@src/service/external';
import {TcpGateWayOptions} from '@src/types';
import {tcpGatewayConfigByEnv} from './config';

/**
 * used to catch error, such as:
 * node Error: read ECONNRESET
 */
process.on('uncaughtException', function (err) {
  console.log('uncaughtException:');
  console.log(err.stack);
});
export async function startTcpGatewayByOptions(options?: TcpGateWayOptions) {
  const {env = process.env.NODE_ENV ?? Env.local, uploadDir, port: tcpPort, staticDir} = options ?? {};
  const tcpGatewayConfig = tcpGatewayConfigByEnv[env as Env];
  if (!tcpGatewayConfig) {
    throw new Error(`Not found config for env: ${env}`);
  }
  const {koa, tcpServerConfig} = tcpGatewayConfig;
  const koaShortCutConfig: KoaShortCutConfig = {
    staticDir,
    uploadDir,
  };
  if (koa) {
    koa.shortCut = koaShortCutConfig;
  }
  if (tcpPort !== undefined) {
    tcpServerConfig.port = tcpPort;
  }
  const {host, port, server, koaServerInfo} = await startCustomizedTcpGateway(tcpGatewayConfig);
  return {host, port, server, tcpGatewayConfig, koaServerInfo};
}

export function serializeTcpGatewayInfo(info: Awaited<ReturnType<typeof startTcpGatewayByOptions>>) {
  const {host, port, koaServerInfo, tcpGatewayConfig} = info;
  const serializeableInfo = {
    host,
    port,
    tcpGatewayConfig: serializeTcpGatewayConfig(tcpGatewayConfig),
    koaServerInfo: {
      origin: koaServerInfo.origin,
    },
  };
  return serializeableInfo;
}
