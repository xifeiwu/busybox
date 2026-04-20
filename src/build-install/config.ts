interface CmdInfo {
  /** relative path to src dir */
  filePath: string;
  runtime?: 'node' | 'ts-node';
  // Support link to global bin dir or not, as some command is not ready to be used as global bin command.
  noLink?: boolean;
}
/**
 * Not add extname of command, as the extname can be .ts or .js
 */
export const BIN_TO_COMMAND: Record<string, CmdInfo> = {
  'build-install': {
    filePath: 'src/build-install/command',
  },
  nb: {filePath: 'src/1-command/node-busybox/index'},
  'tcp-gateway': {
    filePath: 'src/tcp-gateway/command',
  },
  'login-to-server': {filePath: 'src/1-command/login-to-server'},
  runTsExport: {filePath: 'src/1-command/run-ts-export'},
  runTsScript: {filePath: 'src/1-command/run-ts-script'},
  subrepo: {
    filePath: 'src/1-command/subrepo',
    /** It must run on ts-node, as this cmd need to import .ts file */
    runtime: 'ts-node',
  },
  'http-server': {
    filePath: 'src/1-command/http-server',
  },
  'io-transparent': {
    /**
     * As this file is outside src folder, make sure it's compiled duirng tsc process
     * by add it path in include part of tsconfig.json
     */
    filePath: 'modules/lib/node/utils/cp-script/io-transparent',
    noLink: true,
  },
  'build-sqlite3': {
    filePath: 'src/1-command/build-sqlite3',
  },
  ap: {
    filePath: 'src/1-command/assist-prettier',
  },
  ag: {
    filePath: 'src/git/command',
  },
  db: {
    filePath: 'src/db/command',
  },
  pm: {
    filePath: 'src/process-manager/command',
  },
};
