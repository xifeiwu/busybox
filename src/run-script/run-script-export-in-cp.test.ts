import path from 'path';
import {runScriptExportInCP} from './run-script-export-in-cp';
import {logColorful} from '../../modules/lib/node';

export async function testRunScriptExportInCP() {
  const scriptPath = path.join(__dirname, 'test/test.ts');
  const result = await runScriptExportInCP(scriptPath, {funcOptions: {funcParams: [10]}});
  logColorful({}, result);
}
// testRunScriptExportInCP();

export async function passFuncNameAndParams() {
  const scriptPath = path.join(__dirname, 'test/test.ts');
  const result = await runScriptExportInCP(scriptPath, {
    funcOptions: {funcName: 'calculate', funcParams: [10]},
  });
  logColorful({}, result);
}
passFuncNameAndParams();
