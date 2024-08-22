import {uploadDirOnHome} from './utils';
import {KoaConfig} from '@src/service/external';

export const config: KoaConfig = {
  /** Make http server can be accessed from outside */
  host: '0.0.0.0',
  port: 80,
  bodyParserOptions: {
    uploadDir: uploadDirOnHome,
  },
  mwConfig: {
    staticWMConfig: {
      spaDirList: [
        {
          fullpath: '/share/code/react/start/browser-feature/react-tsx-less/dist',
          entries: ['net', 'browser-feature'],
        },
      ],
    },
  },
};
