import path from 'path';
import {uploadDirOnCwd} from './utils';
import {KoaConfig, PORT} from '@src/service/external';

export const config: KoaConfig = {
  port: PORT.fullFeatureHttpServer.port,
  bodyParserOptions: {
    uploadDir: uploadDirOnCwd,
  },
  mwConfig: {
    logMWOptions: {
      logBody: {
        maxSize: 1024,
      },
    },
    staticWMConfig: {
      spaDirList: [
        {
          fullpath: path.resolve(process.env.HOME, 'code/react/start/browser-feature/react-tsx-less/dist'),
          entries: ['net', 'browser-feature'],
        },
      ],
    },
  },
};
