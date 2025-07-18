import fs from 'fs';
import path from 'path';
import {DIR_JS_DIST} from '../service';
import {toLocalISOString} from '../service/external';

interface CmdInfo {
  filePath: string;
  runtime?: 'node' | 'ts-node';
}

export const DIST_VERSION_FILE = path.join(DIR_JS_DIST, 'version.txt');

export function writeDistVersion() {
  fs.writeFileSync(DIST_VERSION_FILE, toLocalISOString());
}
export function getDistVersion() {
  try {
    return fs.readFileSync(DIST_VERSION_FILE).toString();
  } catch {
    /** Ignore */
  }
}

/**
 * Not add extname of command, as the extname can be .ts or .js
 */
export const BIN_TO_COMMAND: Record<string, CmdInfo> = {
  nb: {filePath: 'mini-tools/command'},
  runTsExport: {filePath: 'run-script/run-ts-export'},
  runTsScript: {filePath: 'run-script/run-ts-script'},
  'syncup-gitmodules': {
    filePath: 'command/syncup-gitmodules',
    /** It must run on ts-node, as this cmd need to import .ts file */
    runtime: 'ts-node',
  },
};
