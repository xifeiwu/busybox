import {EMethod, SocketServerConfig, getConnectStatusInJson} from '@modules/lib/net/socks';
import {toConsole} from '@modules/lib/node';

export const config: SocketServerConfig = {
  cipher: {},
  methodList: [
    {method: EMethod.NoAuth},
    {method: EMethod.UserPass, info: {username: 'elif.site', password: 'socks5'}},
  ],
  serverConfig: {
    host: '127.0.0.1',
    port: 3080,
    // options: {
    //   allowHalfOpen: true,
    // },
  },
  httpServerConfig: {
    port: 3081,
  },
  // proxyAsSocketClientConfigList: [
  //   {
  //     methodList: [
  //       {method: EMethod.NoAuth},
  //       {method: EMethod.UserPass, info: {username: 'elif.site', password: 'socks5'}},
  //     ],
  //     socketConfig: {
  //       host: 'elif.site',
  //       port: 3307,
  //     },
  //     matches: [
  //       /google/,
  //       /medium.com/,
  //       /bonus.ly/,
  //       /youtube.com/,
  //       /github.com/,
  //       /formulae.brew.sh/,
  //       /chrome\.com/,
  //       'stackoverflow.com',
  //       'www.howtogeek.com',
  //       /imgur\.com/,
  //       /wikipedia/,
  //       /v2ex.com/,
  //     ],
  //   },
  // ],
  onConnection(status) {
    toConsole(getConnectStatusInJson(status));
  },
};

export default config;
