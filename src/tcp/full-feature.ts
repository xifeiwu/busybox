/**
 * A basic server contains frequently used function
 */
import {KoaConfig} from '@src/service/external';
import {config as elifKoaConfig, tcpServerConfig as elifTcpServerConfig} from '@src/config/koa-server/elif';
import {
  startSocketClient,
  startKoaServer,
  customDeepMerge,
  startRedirectSocketServer,
  TcpServerConfig,
  localTcpServerConfig,
  KoaShortCutConfig,
  localKoaConfig,
  serializeKoaConfig,
} from '@src/service/external';
import {Socket} from 'net';
import {isNumber} from '@modules/lib/node';

type Env = 'local' | 'elif';
const configByEnv: {
  [env in Env]: {koa: KoaConfig; tcp: TcpServerConfig};
} = {
  local: {koa: localKoaConfig, tcp: localTcpServerConfig},
  elif: {koa: elifKoaConfig, tcp: elifTcpServerConfig},
};

const customizeDeepMerge = customDeepMerge({mergeArraySolution: 'concat'});
export async function startFullFeatureTcpServer(options?: {
  env?: Env;
  port?: number;
  uploadDir?: string;
  staticDir?: string;
}) {
  const {env = 'local', uploadDir, port: tcpPort, staticDir} = options ?? {};
  const {koa: koaConfig, tcp: tcpServerConfig} = configByEnv[env as Env];
  const mergedKoaConfig = customizeDeepMerge<KoaConfig, KoaConfig>(koaConfig, {});
  const koaShortCutConfig: KoaShortCutConfig = {
    staticDir,
    uploadDir,
  };
  const koaServerInfo = await startKoaServer(mergedKoaConfig, koaShortCutConfig);
  async function httpHandler(socket: Socket) {
    const {host, port} = koaServerInfo;
    const proxyClient = await startSocketClient({host, port});
    socket.pipe(proxyClient).pipe(socket);
  }
  // return await startRedirectSocketServer(
  //   {
  //     httpHandler,
  //     // tcpHandler,
  //   },
  //   tcpServerConfig
  // );

  if (isNumber(tcpPort)) {
    tcpServerConfig.port = tcpPort;
  }
  const {host, port, server} = await startRedirectSocketServer(
    {
      httpHandler,
    },
    {
      ...tcpServerConfig,
    }
  );
  return {host, port, server, koaConfig: serializeKoaConfig(koaConfig)};
}

