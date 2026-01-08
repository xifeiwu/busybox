import fs from 'fs';
import path from 'path';
import {DIR_DIST, DIR_PROJECT} from '../service';
import {execCmdWithOptions, formatDate} from '../service/external';

export const DIST_VERSION_FILE = path.join(DIR_DIST, 'version.txt');
export const DEFAULT_BIN_DIR = path.resolve(process.env.HOME, 'code/bin');

export function writeDistVersion() {
  fs.writeFileSync(DIST_VERSION_FILE, formatDate(new Date(), 'yyyy-MM-ddThh-mm-ss'));
}
export function getDistVersion() {
  try {
    return fs.readFileSync(DIST_VERSION_FILE).toString();
  } catch {
    /** Ignore */
  }
}

export function backupDist() {
  const distVersion = getDistVersion();
  if (!distVersion) {
    throw new Error(`Can't find dist version, make sure project is compiled`);
  }
  process.chdir(DIR_PROJECT);
  const gzFile = `busybox-dist.${distVersion.replaceAll(':', '-')}.tar.gz`;
  execCmdWithOptions(`tar -zcvf ${gzFile} ./dist`);
  return gzFile;
}

export type ProjectMode = 'ts' | 'js';

export interface GenerateOptions {
  projectMode?: ProjectMode;
}
