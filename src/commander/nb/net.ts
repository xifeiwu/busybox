import {Command} from 'commander';
import {
  isPortOpen,
  getLocalIpAddress,
  logColorful,
  toNormalizedUrlProps,
  calNetSpeed,
  echoDataOverTcp,
} from '@src/service/external';

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
    const urlProps = toNormalizedUrlProps(href);
    logColorful({}, urlProps);
  });
  program.command('net-quality <origin>').action(async origin => {
    calNetSpeed({origin, type: 'upload'}, ({speed}) => {
      logColorful({color: 'red'}, speed);
    });
  });
  // program.command('echo <origin> <data>').action(async (origin, data) => {
  //   echoDataOverTcp({origin}, data);
  // });
}
