import {Command} from 'commander';
import {startDefaultServer} from '@modules/lib/net/koa';

const program = new Command();
program.argument('[staticDir]', 'static dir').action(async configFile => {
  const httpServiceInfo = await startDefaultServer();
  // console.log(httpServiceInfo);
});
program.parse(process.argv);
