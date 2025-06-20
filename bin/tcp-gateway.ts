/**
 * A basic server contains frequently used function
 */
import {Command} from 'commander';
import {startTcpGatewayByOptionsAndPrintInfo} from '@src/command/tcp-gateway';

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
