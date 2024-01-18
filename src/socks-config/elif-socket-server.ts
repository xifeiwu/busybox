import {EMethod, SocketServerConfig, getConnectStatusInJson} from '@modules/lib/net/socks';
import {toConsole} from '@modules/lib/node';

export const config: SocketServerConfig = {
  methodList: [
    // {method: EMethod.NoAuth},
    {method: EMethod.UserPass, info: {username: 'elif.site', password: 'socks5'}},
  ],
  serverConfig: {
    host: '0.0.0.0',
    port: 3307,
    // options: {
    //   allowHalfOpen: true,
    // },
  },
  httpServerConfig: {
    port: 3308
  },
  onConnection(status) {
    toConsole(getConnectStatusInJson(status));
  },
};
