interface CmdInfo {
  filePath: string;
  runtime?: 'node' | 'ts-node';
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
