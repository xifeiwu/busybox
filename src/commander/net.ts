import {Command} from 'commander';
import {PORT, isPortOpen} from '@src/service/external';
import {startDebugServer} from '@modules/lib/net/koa';

const program = new Command();

program.name('net').description('utility for net handling');

program.command('port-check <host> <port>').action(async (host, port, args, command) => {
  console.log(host, port);
  const isOK = await isPortOpen(port, host);
  console.log(`isOK: ${isOK}`);
});

program
  .command('basic-http-server')
  .option('-p, --port', 'port for the basic http server')
  .action(async options => {
    const {port = PORT.basicHttpServer.port} = options;
    const inUse = await isPortOpen(port);
    if (inUse) {
      throw new Error(`port ${port} is inuse`);
    }
    const {origin} = await startDebugServer([], {
      port,
    });
    console.log(`http server start at: ${origin}`);
  });

program.parse(process.argv);
