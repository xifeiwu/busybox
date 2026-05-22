import fs from 'fs';
import path from 'path';
import {logColorful, META_DIR_NAME} from '../external';

function isMetaDir(dirPath: string): boolean {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/**
 * Walk upward from `startDir` until a directory contains `.meta/`.
 */
export function findAssetsRootDir(dirOption?: string): string {
  let current = path.resolve(process.cwd(), dirOption ?? '.');
  if (dirOption && !fs.existsSync(current)) {
    throw new Error(`Directory does not exist: ${current}`);
  }
  const fsRoot = path.parse(current).root;
  while (true) {
    if (isMetaDir(path.join(current, META_DIR_NAME))) {
      return current;
    }
    if (current === fsRoot) {
      break;
    }
    current = path.dirname(current);
  }
  const hint = dirOption ? ` (from -d ${dirOption})` : ' (from cwd)';
  throw new Error(
    `Assets root not found${hint}: no "${META_DIR_NAME}/" directory found while searching upward. Run "assets init" first.`
  );
}

export function logAssetsRoot(rootDir: string) {
  logColorful({}, `rootDir: ${rootDir}`);
}
