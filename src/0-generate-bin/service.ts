import fs from 'fs';
import path from 'path';
import {DIR_DIST} from '../service';
import {formatDate, toLocalISOString} from '../service/external';

interface CmdInfo {
  filePath: string;
  runtime?: 'node' | 'ts-node';
  // Support link to global bin dir or not, as some command is not ready to be used as global bin command.
  noLink?: boolean;
}

export const DIST_VERSION_FILE = path.join(DIR_DIST, 'version.txt');

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

/**
 * Not add extname of command, as the extname can be .ts or .js
 */
export const BIN_TO_COMMAND: Record<string, CmdInfo> = {
  'generate-bin': {
    filePath: '0-generate-bin/command',
    noLink: true,
  },
  nb: {filePath: 'mini-tools/command'},
  runTsExport: {filePath: 'run-script/run-ts-export'},
  runTsScript: {filePath: 'run-script/run-ts-script'},
  'syncup-gitmodules': {
    filePath: 'command/syncup-gitmodules',
    /** It must run on ts-node, as this cmd need to import .ts file */
    runtime: 'ts-node',
  },
  'io-transparent': {
    filePath: 'command/io-transparent',
    noLink: true,
  },
};
