import {EMethod, SocketServerConfig} from '@modules/lib/net/socks';

export const config: SocketServerConfig = {
  isStartHttpServer: true,
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
  onConnection(status) {},
};

export default config;
