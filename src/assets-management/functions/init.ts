import fs from 'fs';
import {getMetaDir, getFileMetaHandler, logColorful} from '../external';

export async function runInitMeta(options: {rootDir?: string}) {
  const {rootDir = process.cwd()} = options;
  const metaDir = getMetaDir(rootDir);
  if (fs.existsSync(metaDir)) {
    throw new Error(`Meta directory already exists, please remove it before init: ${metaDir}`);
  }
  await getFileMetaHandler({reset: true})(rootDir);
  logColorful({color: 'green'}, `init meta for dir success: ${metaDir}`);
  return rootDir;
}
