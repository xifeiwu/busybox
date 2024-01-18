import {Command} from 'commander';
import {isPortOpen} from '@modules/lib/node';

const program = new Command();

program.name('net').description('utility for net handling');

program.command('port-check <host> <port>').action(async (host, port, args, command) => {
  console.log(host, port);
  const isOK = await isPortOpen(port, host);
  console.log(`isOK: ${isOK}`);
});

program.parse(process.argv);
