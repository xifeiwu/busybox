import {handler} from './run-ts-export';

export async function test() {
  const scriptPath = '/Users/wuxifei/code/conviva/Instant-Filter-Server/assist/feature/auth/explore.ts';
  const configFile = '/Users/wuxifei/code/conviva/Instant-Filter-Server/assist/bin/run-ts-export-config.ts';
  await handler(scriptPath, undefined, undefined, {configFile});
}
