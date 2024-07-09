import fs from 'fs';
import path from 'path';
import {runSocksServeronSocket, SocketServerConfig} from '@modules/lib/net/socks';
import {Command} from 'commander';
import {srcDir} from '@src/service';

const program = new Command();
program.argument('[configFile]', 'socks server config').action(async configFile => {
  const configDir = path.resolve(srcDir, 'config/socks');
  const fullPath = [configFile, path.resolve(configDir, configFile)].find(it => {
    return fs.existsSync(it);
  });

  // const { fullPath, relativePath } = await selectFile({
  //   targetDir: payloadDir,
  // });
  const {config} = require(fullPath) as {config: SocketServerConfig};
  if (!config) {
    throw new Error(`config is not found`);
  }
  const {socksService, httpService} = await runSocksServeronSocket(config);
});
program.parse(process.argv);
