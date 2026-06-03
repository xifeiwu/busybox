import {
  SOCKS_AUTH_DEFAULT_USER_PASS,
  KoaConfig,
  defaultMwConfig,
  SocksServerConfigPerVersion,
  TcpGateWayConfig,
  TcpServerConfig,
  uploadDirOnHome,
} from '../../service/external';
import path from 'path';

export const SOCKS_SERVER_CONFIG: Partial<SocksServerConfigPerVersion> = {
  '1': {
    socksVersion: 1,
    auth: SOCKS_AUTH_DEFAULT_USER_PASS,
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
    static: {
      staticConfigList: [
        {
          dir: path.join('/home/xifei', 'code/huffie/xifeiwu.github.io'),
          // urlPrefix: '/resume',
          fallbackUrl: {
            '/resume': '/index.html',
          },
        },
      ],
      // spaConfigList: [
      //   {
      //     dir: path.resolve(process.env.HOME, 'code/react/start/small-apps-wrapper/dist'),
      //     entryToDistFile: {
      //       '/browser-runtime/feature': '/browser-runtime/feature.html',
      //       '/react-feature/feature': '/react-feature/feature.html',
      //       '/forum': '/forum.html',
      //       '/auth': '/auth.html',
      //     },
      //   },
      // ],
    },
    socks: SOCKS_SERVER_CONFIG,
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
      git: 'git@elif.site:fe/module/assets.git',
    },
  },
  middlewares: [],
  koa: {
    config: koaConfig,
  },
};
