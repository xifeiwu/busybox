/**
 * A basic server contains frequently used function
 */
import {Command} from 'commander';
import {KoaConfig, deepMerge, startKoaServer} from '@src/service/external';
import {config as elifConfig} from '@src/config/http-server/elif';
import {config as localConfig} from '@src/config/koa-server/local';
import {mwConfigDefault} from '@modules/lib/net';
import {logColorful} from '@modules/lib/node';

type Env = 'local' | 'elif';
const configByEnv: {
  [env in Env]: KoaConfig;
} = {
  local: localConfig,
  elif: elifConfig,
};
const program = new Command();
program
  .argument('[staticDir]', 'static dir')
  .option('-e, --env <env>', 'env to run this command: local | elif')
  .option('-p, --port <port>', 'the port used for http server')
  .option('-u, --upload-dir <upload>', 'dir to locate upload files')
  .action(async (staticDir, options) => {
    const {env = 'local', port, uploadDir} = options;
    const envConfig: Partial<KoaConfig> = configByEnv[env as Env] ? configByEnv[env as Env] : {};
    const mergedConfig = deepMerge({mwConfig: mwConfigDefault}, envConfig);
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
