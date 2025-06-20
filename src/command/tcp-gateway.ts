/**
 * A basic server contains frequently used function
 */
import path from 'path';
import {Env, logColorful} from '@src/service/external';
import {serializeTcpGatewayInfo, startTcpGatewayByOptions} from '@src/tcp-gateway';
import {TcpGateWayOptions} from '@src/types';

export async function startTcpGatewayByOptionsAndPrintInfo(
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
