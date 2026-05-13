import assert from 'assert';
import path from 'path';
import {runExport} from '../../service/run-export';

const targetScript = path.join(__dirname, '../project/index.ts');
const targetScriptJs = path.join(__dirname, '../project/index.js');

export async function testBasicFuncNameAndParams() {
  const result = await runExport(targetScript, {funcName: 'add1', funcParams: [10]});
  assert.ok(result.pid > 0);
  assert.ok(result.supportIpc);
  assert.ok(result.spawnTime);
  console.log('PASS: testBasicFuncNameAndParams');
}

export async function testFuncNameOnlyEmptyParams() {
  const result = await runExport(targetScript, {funcName: 'add2', funcParams: []});
  assert.ok(result.pid > 0);
  console.log('PASS: testFuncNameOnlyEmptyParams');
}

export async function testDryRun() {
  const result = await runExport(targetScript, {funcName: 'add1', funcParams: [], options: {dryRun: true}});
  assert.strictEqual(result, undefined);
  console.log('PASS: testDryRun');
}

export async function testWithConfigFile() {
  const configFile = path.join(__dirname, '../project/run-export.config.js');
  const result = await runExport(targetScript, {funcName: 'add1', funcParams: [10], options: {configFile}});
  assert.ok(result.pid > 0);
  console.log('PASS: testWithConfigFile');
}

export async function testJsBasicFuncNameAndParams() {
  const result = await runExport(targetScriptJs, {funcName: 'add1', funcParams: [10]});
  assert.ok(result.pid > 0);
  assert.ok(result.supportIpc);
  assert.ok(result.spawnTime);
  console.log('PASS: testJsBasicFuncNameAndParams');
}

export async function testJsWithConfigFile() {
  const configFile = path.join(__dirname, '../project/run-export.config.js');
  const result = await runExport(targetScriptJs, {funcName: 'add1', funcParams: [10], options: {configFile}});
  assert.ok(result.pid > 0);
  console.log('PASS: testJsWithConfigFile');
}

async function runAll() {
  await testWithConfigFile();
  return;
  await testBasicFuncNameAndParams();
  await testFuncNameOnlyEmptyParams();
  await testDryRun();
  await testJsBasicFuncNameAndParams();
  await testJsWithConfigFile();
  console.log('All tests passed');
}
runAll();
