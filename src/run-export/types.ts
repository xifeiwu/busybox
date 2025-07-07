import {RunScriptExportOptions} from '../../modules/lib/node/types/utils';

export interface RunScriptExportInCPOptions extends RunScriptExportOptions {
  dryRun?: boolean;
}

export interface RunScriptExportConfig extends RunScriptExportOptions {
  scriptPath: string;
}
