/**
 * A basic server contains frequently used function
 */
import path from 'path';
import {Command} from 'commander';
import {
  closePortIfInUse,
  Env,
  KoaShortCutConfig,
  logColorful,
  startTcpGateway,
  TCP_GATEWAY_DEFAULT_CONFIG,
} from '../../service/external';
import {TcpGateWayOptions} from '../../types';
import {serializeTcpGatewayInfo} from '../server';

/**
 * used to catch error, such as:
 * node Error: read ECONNRESET
 */
process.on('uncaughtException', function (err) {
  console.log('uncaughtException:');
  console.log(err.stack);
});
async function startTcpGatewayByOptions(options?: TcpGateWayOptions) {
  const {env = process.env.NODE_ENV ?? Env.local, uploadDir, staticDir, port} = options ?? {};
  let tcpPort = parseInt(port as string, 10);
  /** Must to use the port is it's not undefined */
  if (!Number.isNaN(tcpPort)) {
    if (!(await closePortIfInUse(tcpPort))) {
      throw new Error(`port ${tcpPort} is in use`);
    }
  }

  const tcpGatewayConfig = TCP_GATEWAY_DEFAULT_CONFIG;
  delete tcpGatewayConfig.tcpServerConfig.port;
  delete tcpGatewayConfig.koa.config.port;
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
  // console.log('tcpGatewayConfig', tcpGatewayConfig);
  const {host, port: finalPort, server, koaServerInfo} = await startTcpGateway(tcpGatewayConfig);
  return {host, port: finalPort, server, tcpGatewayConfig, koaServerInfo};
}

async function startTcpGatewayByOptionsAndPrintInfo(
  options: Omit<TcpGateWayOptions, 'staticDir'>,
  staticDir?: string
) {
  const {env = process.env.NODE_ENV ?? 'local', uploadDir, port} = options;
  const info = await startTcpGatewayByOptions({
    env: env as Env,
    staticDir: staticDir ? path.resolve(process.cwd(), staticDir) : undefined,
    uploadDir,
    port,
  });
  logColorful({}, serializeTcpGatewayInfo(info));
}

export async function testStartTcpGatewayByOptions() {
  await startTcpGatewayByOptionsAndPrintInfo({}, '/Users/xfwu/Documents/jingyuexing.github.io');
}

/**
 * Should take care about NODE_ENV, as config of tcp service depends on config get by env
 */
const program = new Command();
program
  .argument('[staticDir]', 'static dir')
  .option('-e, --env <env>', 'env to run this command: local | elif')
  .option('-p, --port <port>', 'the port used for http server')
  .option('-u, --upload-dir <upload>', 'dir to locate upload files')
  .action(async (staticDir, options) => {
    await startTcpGatewayByOptionsAndPrintInfo(options, staticDir);
  });
program.parse(process.argv);
