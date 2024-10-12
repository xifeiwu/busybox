/**
 * A basic server contains frequently used function
 */
import {Command} from 'commander';
import {KoaConfig, deepMerge, PORT} from '@src/service/external';
import {config as elifConfig} from '@src/config/http-server/elif';
import {config as localConfig} from '@src/config/koa-server/local';
import {toNumber, mwConfigCommon, startSyntheticTcpServer, logColorful} from '@src/service/external';
import {isNumber} from '@modules/lib/node';

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
    const {env = 'local', uploadDir} = options;
    const portToNumber = toNumber(options.port);
    const envConfig: Partial<KoaConfig> = configByEnv[env as Env] ? configByEnv[env as Env] : {};
    const mergedConfig = deepMerge({mwConfig: mwConfigCommon}, envConfig);
    delete mergedConfig['port'];
    // const {app} = getKoa(mergedConfig, );
    const {host, port} = await startSyntheticTcpServer({
      koaConfig: mergedConfig,
      koaShortCutConfig: {staticDir, uploadDir},
      tcpServerConfig: {
        host: '0.0.0.0',
        port: isNumber(portToNumber) ? portToNumber : PORT.fullFeatureTcpServer.port,
      },
    });
    logColorful({color: 'yellow'}, mergedConfig);
    logColorful({}, {host, port}, `http://${host}:${port}`);
  });
program.parse(process.argv);
