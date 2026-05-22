import fs from 'fs';
import {getMetaDir, getFileMetaHandler} from '../external';

export async function init(options: {dir?: string}) {
  const {dir = process.cwd()} = options;
  const metaDir = getMetaDir(dir);
  if (fs.existsSync(metaDir)) {
    throw new Error(`Meta directory already exists, please remove it before init: ${metaDir}`);
  }
  await getFileMetaHandler()(metaDir);
  return dir;
}
