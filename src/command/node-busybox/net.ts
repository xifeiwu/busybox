import dns from 'dns';
import {Command} from 'commander';
import {
  isPortOpen,
  getLocalIpAddress,
  logColorful,
  toNormalizedUrlProps,
  getDownloadSpeed,
} from '../../service/external';

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
  program.command('dns-lookup <domain>').action(async doman => {
    const {address} = await dns.promises.lookup(doman);
    logColorful({color: 'green'}, address);
  });
  program.command('local-ip').action(async (host, port, args, command) => {
    const localIp = getLocalIpAddress();
    logColorful({}, localIp);
  });
  program.command('parse-href <href>').action(async href => {
    const urlProps = toNormalizedUrlProps(href);
    logColorful({}, urlProps);
  });
  program.command('net-speed <origin>').action(async origin => {
    const speedInfo = await getDownloadSpeed(origin, {
      intervalCb(info) {
        logColorful({color: 'green'}, info);
      },
    });
    logColorful({color: 'red'}, speedInfo);
  });
}
