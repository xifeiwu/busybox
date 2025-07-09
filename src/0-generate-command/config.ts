/**
 * Not add extname of command, as the extname can be .ts or .js
 */
export const BIN_TO_COMMAND: Record<string, string> = {
  nb: 'mini-tools/command',
  runTsExport: 'run-script/run-ts-export',
  runTsScript: 'run-script/run-ts-script',
};
