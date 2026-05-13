export interface RunTsExportOptions {
  /** Function name to run */
  funcName: string;
  /** Function params to pass */
  funcParams: string[];
  options?: {
    /** If true, only print the command without actually running it */
    dryRun?: boolean;
    /** Config file path for run-ts-export */
    configFile?: string;
  };
}
