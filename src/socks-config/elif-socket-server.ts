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
    options: {
      allowHalfOpen: true,
    },
  },
  httpServerConfig: {
    port: 3308
  },
  // proxyAsSocketClientConfigList: [
  //   {
  //     methodList: [
  //       {method: EMethod.NoAuth},
  //       {method: EMethod.UserPass, info: {username: 'aaa', password: 'socksService1'}},
  //     ],
  //     socketConfig: {
  //       host,
  //       port: socksService1.port,
  //     },
  //     matches: [/elif\.site/, {address: host, port: targetServerInfo1.port}],
  //   },
  // ],
  onConnection(status) {
    toConsole(getConnectStatusInJson(status));
  },
};
