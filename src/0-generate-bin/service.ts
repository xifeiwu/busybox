import fs from 'fs';
import path from 'path';
import {DIR_DIST} from '../service';
import {formatDate} from '../service/external';

export const DIST_VERSION_FILE = path.join(DIR_DIST, 'version.txt');
export const DEFAULT_BIN_DIR = path.resolve(process.env.HOME, 'code/bin');

export function writeDistVersion() {
  fs.writeFileSync(DIST_VERSION_FILE, formatDate(new Date(), 'yyyy-MM-ddThh:mm:ss'));
}
export function getDistVersion() {
  try {
    return fs.readFileSync(DIST_VERSION_FILE).toString();
  } catch {
    /** Ignore */
  }
}

export type ProjectMode = 'ts' | 'js';

export interface GenerateOptions {
  projectMode?: ProjectMode;
}
