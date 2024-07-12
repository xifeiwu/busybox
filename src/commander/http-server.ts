/**
 * A basic server contains frequently used function
 */
import {CustomKoaConfig, deepMerge, startCustomKoaServer} from '@src/service/external';
import {config as elifConfig} from '@src/config/http-server/elif';
import {config as localConfig} from '@src/config/http-server/local';
import {Command} from 'commander';
import {StaticMWConfig} from '@modules/lib/net';
import path from 'path';
import { logColorful } from '@modules/lib/node';

const defaultConfig: CustomKoaConfig = {
  useErrorCatchMW: true,
  useDebugMW: true,
  corsWMOptions: {},
  logsMWOptions: {},
  useForumMW: true,
  printOrigin: true,
};
type Env = 'local' | 'elif';
const configByEnv: {
  [env in Env]: CustomKoaConfig;
} = {
  local: localConfig,
  elif: elifConfig,
};
const program = new Command();
program
  .argument('[staticDir]', 'static dir')
  .option('-p, --port <port>', 'the port used for http server')
  .option('-e, --env <env>', 'env to run this command: local | elif')
  .option('-u, --upload-dir <upload>', 'dir to locate upload files')
  .action(async (staticDir, options) => {
    const {env = 'local'} = options;
    const envConfig: Partial<CustomKoaConfig> = configByEnv[env as Env] ? configByEnv[env as Env] : {};
    if (staticDir) {
      staticDir = path.resolve(process.cwd(), staticDir);
      const {staticWMConfig} = envConfig;
      envConfig.staticWMConfig = deepMerge(staticWMConfig, {
        dirList: [staticDir],
      } as StaticMWConfig);
    }
    const mergedConfig = deepMerge(defaultConfig, envConfig);
    logColorful({color: 'yellow'}, mergedConfig);
    await startCustomKoaServer(mergedConfig);
  });
program.parse(process.argv);
