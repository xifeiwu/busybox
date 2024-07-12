import path from 'path';
import {uploadDirOnCwd} from './utils';
import {CustomKoaConfig, PORT} from '@src/service/external';

export const config: CustomKoaConfig = {
  port: PORT.fullFeatureHttpServer.port,
  bodyParserOptions: {
    uploadDir: uploadDirOnCwd,
  },
  staticWMConfig: {
    spaDirList: [
      {
        fullpath: path.resolve(process.env.HOME, 'code/react/start/browser-feature/react-tsx-less/dist'),
        entries: ['net', 'browser-feature'],
      },
    ],
  },
};
