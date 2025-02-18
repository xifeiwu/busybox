import {InfoToCp} from '@src/service/external';
import {serializeTcpGatewayInfo, startTcpGatewayByOptions} from '@src/tcp-gateway';
import {TcpGateWayOptions} from '@src/types';
import {out, responseError} from './service';
import {startTlsGateway} from './tls-gateway';

export async function start() {
  let ipcMessage: InfoToCp<TcpGateWayOptions> = {};
  if (process.send) {
    ipcMessage = await new Promise<InfoToCp<TcpGateWayOptions>>(res => {
      process.once('message', (chunk: InfoToCp<TcpGateWayOptions>) => {
        res(chunk);
      });
      /** Wait message for one second at most */
      setTimeout(() => {
        res({});
      }, 1000);
    });
  }
  const {config = {}} = ipcMessage;
  try {
    const info = await startTcpGatewayByOptions(config);
    const response = serializeTcpGatewayInfo(info);
    out(response);
  } catch (err) {
    out(responseError(err));
  }
}
start();
/**
 * In order to save resource cost on elif.site, startTlsGateway in the same process.
 */
startTlsGateway();
