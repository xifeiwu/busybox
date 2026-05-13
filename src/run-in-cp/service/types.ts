export interface RunNodeExportOptions {
  /** Function name to run */
  funcName: string;
  /** Function params to pass */
  funcParams: Array<string | number>;
  options?: {
    /** If true, only print the command without actually running it */
    dryRun?: boolean;
    /** Config file path for run-export */
    configFile?: string;
  };
}
