/**
 * A basic server contains frequently used function
 */

import fs from 'fs';
import path from 'path';
import {
  PORT,
  StaticFileInfo,
  startFullFeatureServer,
  getStaticMiddleware,
  StaticMiddlewareOptions,
} from '@src/service/external';
import {Command} from 'commander';

function getStaticMiddlewares() {
  const map = new Map<string, StaticFileInfo>();
  const preferredDir: StaticMiddlewareOptions[] = [
    {
      dir: 'code/react/start/browser-feature/react-tsx-less/dist',
      pathnameRewrite(pathname: string) {
        const spaFile = ['net', 'browser-feature'];
        const target = spaFile.find(it => {
          return pathname.startsWith('/' + it);
        });
        if (target) {
          return '/' + target + '.html';
        }
        return pathname;
      },
    },
  ];
  const baseDirMap = {
    elifServer: '/share',
    local: process.env.HOME,
    /** On remote server, put code under dir `/share` to make it can be shared between all users */
  };
  const middlewareList = preferredDir
    .map(options => {
      const {dir, pathnameRewrite: alias} = options;
      const fullPath = Object.values(baseDirMap)
        .map(it => path.resolve(it, dir))
        .find(it => fs.existsSync(it));
      if (!fullPath) {
        return null;
      }
      return getStaticMiddleware({
        dir: fullPath,
        pathnameRewrite: alias,
        store: map,
      });
    })
    .filter(it => it !== null);
  return middlewareList;
}

const program = new Command();
program
  .argument('[staticDir]', 'static dir')
  .option('-p, --port <port>', 'the port used for http server')
  .action(async (staticDir, options) => {
    const {port = PORT.fullFeatureHttpServer.port} = options;
    console.log(options);
    const staticMiddlewares = getStaticMiddlewares();
    await startFullFeatureServer([...staticMiddlewares], {
      port,
      printOrigin: true,
    });
  });
program.parse(process.argv);
