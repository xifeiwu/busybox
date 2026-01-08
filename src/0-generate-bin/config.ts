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
  // 'generate-bin': {
  //   filePath: '0-generate-bin/run',
  //   noLink: true,
  // },
  nb: {filePath: 'src/1-command/node-busybox/index'},
  'tcp-gateway': {
    filePath: 'src/tcp-gateway/command',
  },
  'login-to-server': {filePath: 'src/1-command/login-to-server'},
  runTsExport: {filePath: 'src/run-script/run-ts-export'},
  runTsScript: {filePath: 'src/run-script/run-ts-script'},
  'syncup-gitmodules': {
    filePath: 'src/1-command/syncup-gitmodules',
    /** It must run on ts-node, as this cmd need to import .ts file */
    runtime: 'ts-node',
  },
  'io-transparent': {
    /** As this file is outside src folder, make sure it's compiled duirng tsc process */
    filePath: 'modules/lib/node/child-process/cp-script/io-transparent',
    noLink: true,
  },
  'http-server': {
    filePath: 'src/1-command/http-server',
  },
};
