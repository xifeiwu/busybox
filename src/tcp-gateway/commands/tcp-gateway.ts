/**
 * A basic server contains frequently used function
 */
import path from 'path';
import {Command} from 'commander';
import {Env, serializeTcpGatewayInfo} from '../../service/external';
import {startTcpGatewayByEnv} from '../server';

/**
 * Should take care about NODE_ENV, as config of tcp service depends on config get by env
 */
const program = new Command();
program
  .argument('[staticDir]', 'static dir')
  .option('-e, --env <env>', 'env to run this command: local | elif')
  .action(async (staticDir, options) => {
    const result = await startTcpGatewayByEnv({
      env: options.env as Env,
    });
    serializeTcpGatewayInfo(result);
    // await startTcpGatewayByEnvAndPrintInfo(options, staticDir);
  });
program.parse(process.argv);
