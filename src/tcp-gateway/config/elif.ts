import {
  SOCKS_AUTH_USER_PASS,
  KoaConfig,
  defaultMwConfig,
  SocksServerConfigPerVersion,
  TcpGateWayConfig,
  TcpServerConfig,
  uploadDirOnHome,
} from '@src/service/external';

export const SOCKS_SERVER_CONFIG: Partial<SocksServerConfigPerVersion> = {
  '1': {
    socksVersion: 1,
    auth: SOCKS_AUTH_USER_PASS,
  },
  // '5': {
  //   socksVersion: 5,
  //   methodList: [
  //     {
  //       method: 0,
  //     },
  //   ],
  // },
};

export const koaConfig: KoaConfig = {
  /** Make http server can be accessed from outside */
  host: '127.0.0.1',
  port: 8880,
  bodyParserOptions: {
    uploadDir: uploadDirOnHome,
  },
  mwConfig: {
    ...defaultMwConfig,
    staticWMConfig: {
      spaDirList: [
        {
          fullpath: '/share/code/react/start/browser-feature/react-tsx-less/dist',
          entries: ['net', 'browser-feature'],
        },
      ],
    },
    socksConfig: SOCKS_SERVER_CONFIG,
  },
  printOrigin: true,
};

export const tcpServerConfig: TcpServerConfig = {
  port: 80,
  host: '0.0.0.0',
};

export const elifTcpGateWayConfig: TcpGateWayConfig = {
  tcpServerConfig: tcpServerConfig,
  mwConfig: {
    socks: SOCKS_SERVER_CONFIG,
    assetsSyncUp: {
      dir: '/share/assets',
      git: 'git@github.com:fe/module/assets.git',
    },
  },
  middlewares: [],
  koa: {
    config: koaConfig,
  },
};
