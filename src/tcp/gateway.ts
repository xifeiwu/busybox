/**
 * A basic server contains frequently used function
 */
import {TcpGateWayConfig} from '@src/service/external';
import {elifTcpGateWayConfig} from '@src/config/tcp-gateway/elif';
import {localTcpGateWayConfig} from '@src/config/tcp-gateway/local';
import {startTcpGateWay, KoaShortCutConfig} from '@src/service/external';
import {isNumber} from '@modules/lib/node';

type Env = 'local' | 'elif';
const configByEnv: {
  [env in Env]: TcpGateWayConfig;
} = {
  local: localTcpGateWayConfig,
  elif: elifTcpGateWayConfig,
};

// const customizeDeepMerge = customDeepMerge({mergeArraySolution: 'concat'});
export async function startTcpGateway(options?: {
  env?: Env;
  port?: number;
  uploadDir?: string;
  staticDir?: string;
}) {
  const {env = 'local', uploadDir, port: tcpPort, staticDir} = options ?? {};
  const tcpGatewayConfig = configByEnv[env as Env];
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
