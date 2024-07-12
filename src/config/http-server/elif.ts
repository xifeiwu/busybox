import {uploadDirOnHome} from './utils';
import {CustomKoaConfig} from '@src/service/external';

export const config: CustomKoaConfig = {
  /** Make http server can be accessed from outside */
  host: '0.0.0.0',
  port: 80,
  bodyParserOptions: {
    uploadDir: uploadDirOnHome,
  },
  staticWMConfig: {
    spaDirList: [
      {
        fullpath: '/share/code/react/start/browser-feature/react-tsx-less/dist',
        entries: ['net', 'browser-feature'],
      },
    ],
  },
};
