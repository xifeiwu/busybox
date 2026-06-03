import path from 'path';
import {PORT, SOCKS_AUTH_DEFAULT_USER_PASS, TCP_GATEWAY_DEFAULT_CONFIG} from '../../service/external';

TCP_GATEWAY_DEFAULT_CONFIG.tcpServerConfig.port = PORT.tcpGatewayServer.port;
TCP_GATEWAY_DEFAULT_CONFIG.mwConfig.socks[5].proxyConfigList = [
  {
    socksVersion: 1,
    auth: SOCKS_AUTH_DEFAULT_USER_PASS,
    socksServer: {
      host: 'elif.site',
      // host: '124.156.155.64',
      port: 80,
    },
    matches: [
      /google/,
      /medium.com/,
      /nodejs.org/,
      /npmjs.com/,
      /reddit.com/,
      /quora.com/,
      /bonus.ly/,
      'stackoverflow.com',
      'www.howtogeek.com',
      /wikipedia/,
      /v2ex.com/,
      /youtube.com/,
      /github/,
    ],
  },
];

TCP_GATEWAY_DEFAULT_CONFIG.koa.config.port = PORT.stableHttpServer.port;
TCP_GATEWAY_DEFAULT_CONFIG.koa.config.mwConfig.static = {
  staticConfigList: [
    {
      dir: path.join(process.env.HOME, 'code/huffie/xifeiwu.github.io'),
      // urlPrefix: '/resume',
      fallbackUrl: {
        '/resume': '/index.html',
      },
    },
  ],
  spaConfigList: [
    {
      dir: path.resolve(process.env.HOME, 'code/react/start/small-apps-wrapper/dist'),
      entryToDistFile: {
        '/browser-runtime/feature': '/browser-runtime/feature.html',
        '/react-feature/feature': '/react-feature/feature.html',
        '/forum': '/forum.html',
        '/auth': '/auth.html',
      },
    },
  ],
};

// TCP_GATEWAY_DEFAULT_CONFIG.tcpServerConfig.port = 3161;
// TCP_GATEWAY_DEFAULT_CONFIG.mwConfig.assetsSyncUp = {
//   dir: '/Users/Shared/assets',
//   // git: 'git@elif.site:fe/module/assets.git',
// };

export const localTcpGateWayConfig = TCP_GATEWAY_DEFAULT_CONFIG;
