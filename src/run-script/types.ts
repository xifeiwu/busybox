import {SpawnOptions} from 'child_process';
import {RunScriptOptions} from '../../modules/lib/node/types/utils';
import {TsNodeOptions} from '../../modules/lib/node/types';

export interface RunScriptExportInCPOptions {
  spawnOptions?: SpawnOptions;
  tsNodeOptions?: TsNodeOptions;
  dryRun?: boolean;
  funcOptions?: RunScriptOptions;
}

// [scriptPath, RunScriptExportOptions]
export type RunScriptExportConfig = [string, RunScriptOptions];
