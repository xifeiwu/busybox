import {handler} from './run-ts-export';

/**
 * How to debug logic in run-ts-export.ts:
 * 1. Switch debug way of this project to `ts-node`
 * 2. Comment out the last line `program.parse` in file run-ts-export.ts to avoid running of this script.
 * 3. start debug
 */
export async function test() {
  const projectDir = '/Users/wuxifei/code/conviva/Instant-Filter-Server';
  process.chdir(projectDir);
  const scriptPath = 'assist/modules/conviva/portal-db/tools/dump/index.ts';
  const configFile = '/Users/wuxifei/code/conviva/Instant-Filter-Server/assist/bin/run-ts-export-config.js';
  await handler(scriptPath, undefined, undefined, {configFile});
}

test();