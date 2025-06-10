/**
 * A basic server contains frequently used function
 */
import {Command} from 'commander';
import {startKoaServer, logColorful, Env} from '@src/service/external';
import {tcpGatewayConfigByEnv} from '@src/tcp-gateway';

const program = new Command();
program
  .argument('[staticDir]', 'static dir')
  .option('-e, --env <env>', 'env to run this command: local | elif')
  .option('-p, --port <port>', 'the port used for http server')
  .option('-u, --upload-dir <upload>', 'dir to locate upload files')
  .action(async (staticDir, options) => {
    const {env = 'local', port, uploadDir} = options;
    const {config: koaConfig} = tcpGatewayConfigByEnv[env as Env].koa;
    const mergedConfig = koaConfig;
    if (port !== undefined) {
      mergedConfig.port = port;
    }
    // if (uploadDir !== undefined) {
    //   const {bodyParserOptions} = mergedConfig;
    //   mergedConfig.bodyParserOptions = deepMerge(bodyParserOptions, {uploadDir});
    // }
    logColorful({color: 'yellow'}, mergedConfig);
    await startKoaServer(mergedConfig, {
      staticDir,
      uploadDir,
    });
  });
program.parse(process.argv);
