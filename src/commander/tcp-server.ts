/**
 * A basic server contains frequently used function
 */
import path from 'path';
import {Command} from 'commander';
import {logColorful} from '@src/service/external';
import {startFullFeatureTcpServer} from '@src/tcp/full-feature';

const program = new Command();
program
  .argument('[staticDir]', 'static dir')
  .option('-e, --env <env>', 'env to run this command: local | elif')
  .option('-p, --port <port>', 'the port used for http server')
  .option('-u, --upload-dir <upload>', 'dir to locate upload files')
  .action(async (staticDir, options) => {
    const {env = 'local', uploadDir, port: tcpPort} = options;
    const {host, port, koaConfig} = await startFullFeatureTcpServer({
      env,
      staticDir: path.resolve(process.cwd(), staticDir),
      uploadDir,
      port: tcpPort,
    });
    logColorful(
      {},
      {
        host,
        port,
        koaConfig,
      }
    );
  });
program.parse(process.argv);
