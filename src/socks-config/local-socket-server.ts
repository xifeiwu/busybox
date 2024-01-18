import {EMethod, SocketServerConfig, getConnectStatusInJson} from '@modules/lib/net/socks';
import {toConsole} from '@modules/lib/node';

export const config: SocketServerConfig = {
  methodList: [
    {method: EMethod.NoAuth},
    {method: EMethod.UserPass, info: {username: 'aaa', password: 'socksService'}},
  ],
  serverConfig: {
    host: '127.0.0.1',
    port: 2080,
    options: {
      allowHalfOpen: true,
    },
  },
  httpServerConfig: {
    port: 2081,
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

export default config;
