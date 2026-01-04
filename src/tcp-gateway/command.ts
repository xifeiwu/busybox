/**
 * A basic server contains frequently used function
 */
import path from 'path';
import {Env, logColorful} from '../service/external';
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


/**
 * A basic server contains frequently used function
 */
import {Command} from 'commander';

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
