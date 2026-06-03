/**
 * A basic server contains frequently used function
 */
import path from 'path';
import {Command} from 'commander';
import {Env, logColorful} from '../../service/external';
import {TcpGateWayOptions} from '../../types';
import {serializeTcpGatewayInfo, startTcpGatewayByEnv} from '../server';

export async function startTcpGatewayByEnvAndPrintInfo(
  options: Omit<TcpGateWayOptions, 'staticDir'>,
  staticDir?: string
) {
  const {env = process.env.NODE_ENV ?? 'local', uploadDir, port} = options;
  const info = await startTcpGatewayByEnv({
    env: env as Env,
    staticDir: staticDir ? path.resolve(process.cwd(), staticDir) : undefined,
    uploadDir,
    port,
  });
  logColorful({}, serializeTcpGatewayInfo(info));
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
    await startTcpGatewayByEnvAndPrintInfo(options, staticDir);
  });
program.parse(process.argv);
