/**
 * A basic server contains frequently used function
 */
import path from 'path';
import {Command} from 'commander';
import {logColorful} from '@src/service/external';
import {serializeTcpGatewayInfo, startTcpGatewayByOptions} from '@src/tcp-gateway';

const program = new Command();
program
  .argument('[staticDir]', 'static dir')
  .option('-e, --env <env>', 'env to run this command: local | elif')
  .option('-p, --port <port>', 'the port used for http server')
  .option('-u, --upload-dir <upload>', 'dir to locate upload files')
  .action(async (staticDir, options) => {
    const {env = process.env.NODE_ENV ?? 'local', uploadDir, port: tcpPort} = options;
    const info = await startTcpGatewayByOptions({
      env,
      staticDir: staticDir ? path.resolve(process.cwd(), staticDir) : undefined,
      uploadDir,
      port: tcpPort,
    });
    logColorful({}, serializeTcpGatewayInfo(info));
  });
program.parse(process.argv);
