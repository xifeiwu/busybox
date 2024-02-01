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
    // options: {
    //   allowHalfOpen: true,
    // },
  },
  httpServerConfig: {
    port: 2081,
  },
  proxyAsSocketClientConfigList: [
    {
      cipher: {},
      methodList: [
        {method: EMethod.NoAuth},
        {method: EMethod.UserPass, info: {username: 'elif.site', password: 'socks5'}},
      ],
      socketConfig: {
        // host: 'elif.site',
        host: '124.156.155.64',
        port: 3307,
        // host: '127.0.0.1',
        // port: 3080,
      },
      matches: [
        /google/,
        /medium.com/,
        /bonus.ly/,
        /youtube.com/,
        /github.com/,
        /formulae.brew.sh/,
        /chrome\.com/,
        'stackoverflow.com',
        'www.howtogeek.com',
        /imgur\.com/,
        /wikipedia/,
        /v2ex.com/,
      ],
    },
  ],
  onConnection(status) {
    toConsole(getConnectStatusInJson(status));
  },
};

export default config;
