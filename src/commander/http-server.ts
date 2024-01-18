import {Command} from 'commander';
import {startKoaServer} from '@modules/lib/net/koa';

const program = new Command();
program.argument('[staticDir]', 'static dir').action(async configFile => {
  const httpServiceInfo = await startKoaServer();
  // console.log(httpServiceInfo);
});
program.parse(process.argv);
