import {KoaConfig, mwConfigDefault, TcpServerConfig, uploadDirOnHome} from '@src/service/external';

export const config: KoaConfig = {
  /** Make http server can be accessed from outside */
  host: '127.0.0.1',
  port: 8880,
  bodyParserOptions: {
    uploadDir: uploadDirOnHome,
  },
  mwConfig: {
    ...mwConfigDefault,
    staticWMConfig: {
      spaDirList: [
        {
          fullpath: '/share/code/react/start/browser-feature/react-tsx-less/dist',
          entries: ['net', 'browser-feature'],
        },
      ],
    },
  },
  printOrigin: true,
};

export const tcpServerConfig: TcpServerConfig = {
  port: 80,
  host: '0.0.0.0',
};
