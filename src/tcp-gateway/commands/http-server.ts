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
import {serializeTcpGatewayInfo, startTcpGatewayByDefaultConfig} from '../server';

/**
 * used to catch error, such as:
 * node Error: read ECONNRESET
 */
process.on('uncaughtException', function (err) {
  console.log('uncaughtException:');
  console.log(err.stack);
});

async function startTcpGatewayByOptionsAndPrintInfo(
  options: Omit<TcpGateWayOptions, 'staticDir'>,
  staticDir?: string
) {
  const {uploadDir, port} = options;
  const info = await startTcpGatewayByDefaultConfig({
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
    await startTcpGatewayByOptionsAndPrintInfo(options, staticDir);
  });
program.parse(process.argv);
