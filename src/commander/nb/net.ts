import {Command} from 'commander';
import {isPortOpen, getLocalIpAddress, logColorful} from '@src/service/external';
import {toUrlProps} from '@modules/lib/node';

export function appendNetCommand(program: Command) {
  program.command('port-check <host> [port]').action(async (host, port, args, command) => {
    if (port === undefined) {
      port = host;
      host = '127.0.0.1';
    }
    console.log(host, port);
    const isOK = await isPortOpen(port, host);
    console.log(`isOK: ${isOK}`);
  });
  program.command('local-ip').action(async (host, port, args, command) => {
    const localIp = getLocalIpAddress();
    logColorful({}, localIp);
  });
  program.command('parse-href <href>').action(async href => {
    const urlProps = toUrlProps(href);
    logColorful({}, urlProps);
  });
}
