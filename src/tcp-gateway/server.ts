/**
 * A basic server contains frequently used function
 */
import {startTcpGateway, Env, closePortIfInUse, AssistServiceConfig} from '../service/external';
import {ASSIST_SERVER_CONFIG_BY_ENV} from './config/by-env';
import {LOCAL_ASSIST_SERVER_CONFIG} from './config/local';
import {ShortCutConfig} from './types';

/**
 * used to catch error, such as:
 * node Error: read ECONNRESET
 */
process.on('uncaughtException', function (err) {
  console.log('uncaughtException:');
  console.log(err.stack);
});

async function mergeTcpGatewayOptions(serviceConfig: AssistServiceConfig, options?: ShortCutConfig) {
  const {gateway} = options ?? {};
  // const {uploadDir, staticDir, port} = koa ?? {};
  let tcpPort = parseInt(gateway?.port as string, 10);
  /** Must to use the port is it's not undefined */
  if (!Number.isNaN(tcpPort)) {
    if (!(await closePortIfInUse(tcpPort, {doubleConfirm: true}))) {
      throw new Error(`port ${tcpPort} is in use`);
    }
    if (Array.isArray(serviceConfig.gateway)) {
      serviceConfig.gateway.push({port: tcpPort});
    } else {
      serviceConfig.gateway = [{port: tcpPort}];
    }
  }
  if (options?.koa && serviceConfig.koa) {
    const {uploadDir, staticDir} = options.koa;
    if (!serviceConfig.koa.shortCut) {
      serviceConfig.koa.shortCut = {};
    }
    if (staticDir) {
      serviceConfig.koa.shortCut.staticDir = staticDir;
    }
    if (uploadDir) {
      serviceConfig.koa.shortCut.uploadDir = uploadDir;
    }
  }
  return serviceConfig;
}

export async function startTcpGatewayByDefaultConfig(options?: ShortCutConfig) {
  const config = await mergeTcpGatewayOptions(LOCAL_ASSIST_SERVER_CONFIG, options);
  const {gateway, koaServerInfo} = await startTcpGateway(config);
  return {config, gateway, koaServerInfo};
}

/**
 * All config comes from env config.
 * Mainly used by start assist server from child process
 * @param options
 * @returns
 */
export async function startTcpGatewayByEnv(options?: {env?: Env}) {
  const {env = process.env.NODE_ENV ?? Env.local} = options ?? {};
  const config = ASSIST_SERVER_CONFIG_BY_ENV[env as Env];
  if (!config) {
    throw new Error(`Not found config for env: ${env}`);
  }
  const {gateway, koaServerInfo} = await startTcpGateway(config);
  return {config, gateway, koaServerInfo};
}
