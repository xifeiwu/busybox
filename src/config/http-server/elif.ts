import { uploadDirOnHome} from './utils';
import {CustomKoaConfig, } from '@src/service/external';

export const config: CustomKoaConfig = {
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
    ]

  }
}