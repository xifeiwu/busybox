import path from 'path';
import {
  PORT,
  SOCKS_AUTH_DEFAULT_USER_PASS,
  KoaConfig,
  SocksServerConfigPerVersion,
  AssistServiceConfig,
  TcpServerConfig,
  DEFAULT_KOA_CONFIG,
  SOCKS_SERVER_CONFIG,
} from '../../service/external';

const localSocksConfig: Partial<SocksServerConfigPerVersion> = {
  '1': SOCKS_SERVER_CONFIG['1'],
  '5': {
    ...SOCKS_SERVER_CONFIG['5'],
    proxyConfigList: [
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
    ],
  },
};

const koaConfig: KoaConfig = {
  ...DEFAULT_KOA_CONFIG,
  // port: PORT.stableHttpServer.port,
  mwConfig: {
    ...DEFAULT_KOA_CONFIG.mwConfig,
    static: {
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
    },
    socks: localSocksConfig,
  },
};

// tcpServerConfig.port = 3161;
// assetsSyncUp: {
//   dir: '/Users/Shared/assets',
//   // git: 'git@elif.site:fe/module/assets.git',
// },

export const LOCAL_ASSIST_SERVER_CONFIG: AssistServiceConfig = {
  // tcpServerConfig,
  tcp: {
    mwConfig: {
      socks: localSocksConfig,
    },
    middlewares: [],
  },
  koa: {
    config: koaConfig,
  },
};

export const tcpPort3160: TcpServerConfig = {
  host: '0.0.0.0',
  port: PORT.tcpGatewayServer.port,
};
