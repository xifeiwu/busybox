/**
 * A basic server contains frequently used function
 */
import {
  startTcpGateway,
  KoaShortCutConfig,
  Env,
  serializeTcpGatewayConfig,
  closePortIfInUse,
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
  const {env = process.env.NODE_ENV ?? Env.local, uploadDir, staticDir, port} = options ?? {};
  let tcpPort = parseInt(port as string, 10);
  /** Must to use the port is it's not undefined */
  if (!Number.isNaN(tcpPort)) {
    if (!(await closePortIfInUse(tcpPort))) {
      throw new Error(`port ${tcpPort} is in use`);
    }
  }

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
  if (Number.isInteger(tcpPort)) {
    tcpServerConfig.port = tcpPort;
  }
  const {host, port: finalPort, server, koaServerInfo} = await startTcpGateway(tcpGatewayConfig);
  return {host, port: finalPort, server, tcpGatewayConfig, koaServerInfo};
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
