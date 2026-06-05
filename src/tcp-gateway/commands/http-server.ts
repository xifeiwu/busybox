/**
 * A basic server contains frequently used function
 */
import path from 'path';
import {Command} from 'commander';
import {logColorful, serializeTcpGatewayInfo} from '../../service/external';
import {startTcpGatewayByDefaultConfig} from '../server';

/**
 * used to catch error, such as:
 * node Error: read ECONNRESET
 */
process.on('uncaughtException', function (err) {
  console.log('uncaughtException:');
  console.log(err.stack);
});

/**
 * Should take care about NODE_ENV, as config of tcp service depends on config get by env
 */
const program = new Command();
program
  .argument('[staticDir]', 'static dir')
  .option('-p, --port <port>', 'the port used for http server')
  .option('-u, --upload-dir <upload>', 'dir to locate upload files')
  .action(async (staticDir, options) => {
    const {port, uploadDir} = options ?? {};
    const result = await startTcpGatewayByDefaultConfig({
      koa: {
        staticDir: staticDir ? path.resolve(process.cwd(), staticDir) : undefined,
        uploadDir,
      },
      gateway: {
        port,
      },
    });
    serializeTcpGatewayInfo(result);
  });
program.parse(process.argv);
