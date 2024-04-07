import {Command} from 'commander';
import {PORT, isPortOpen, startDebugServer} from '@src/service/external';

const program = new Command();

program.name('net').description('utility for net handling');

program.command('port-check <host> [port]').action(async (host, port, args, command) => {
  if (port === undefined) {
    port = host;
    host = '127.0.0.1';
  }
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
