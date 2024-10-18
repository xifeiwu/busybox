/**
 * A basic server contains frequently used function
 */
import {serializeTcpGatewayConfig, TcpGateWayConfig} from '@src/service/external';
import {startTcpGateWay, KoaShortCutConfig} from '@src/service/external';
import {isNumber} from '@modules/lib/node';
import {Env, TcpGateWayOptions} from '@src/types';
import {tcpGatewayConfigByEnv} from '@src/config/tcp-gateway';

// export const configByEnv: {
//   [env in Env]: TcpGateWayConfig;
// } = {
//   local: localTcpGateWayConfig,
//   elif: elifTcpGateWayConfig,
// };
/**
 * used to catch error, such as:
 * node Error: read ECONNRESET
 */
process.on('uncaughtException', function (err) {
  console.log('uncaughtException:');
  console.log(err.stack);
});
// const customizeDeepMerge = customDeepMerge({mergeArraySolution: 'concat'});
export async function startTcpGatewayByOptions(options?: TcpGateWayOptions) {
  const {env = 'local', uploadDir, port: tcpPort, staticDir} = options ?? {};
  const tcpGatewayConfig = tcpGatewayConfigByEnv[env as Env];
  const {koa, tcpServerConfig} = tcpGatewayConfig;
  // const mergedKoaConfig = customizeDeepMerge<KoaConfig, KoaConfig>(koaConfig, {});
  const koaShortCutConfig: KoaShortCutConfig = {
    staticDir,
    uploadDir,
  };
  if (koa) {
    koa.shortCut = koaShortCutConfig;
  }
  if (isNumber(tcpPort)) {
    tcpServerConfig.port = tcpPort;
  }
  const {host, port, server, koaServerInfo} = await startTcpGateWay(tcpGatewayConfig);
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
