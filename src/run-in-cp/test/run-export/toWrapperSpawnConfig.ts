import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {toWrapperSpawnConfig} from '../../service/run-export';

const projectDir = path.join(__dirname, '../project');
const targetScript = path.join(projectDir, 'index.ts');
const targetScriptJs = path.join(projectDir, 'index.js');
const pkgJsonPath = path.join(projectDir, 'package.json');
const originalPkgJson = fs.readFileSync(pkgJsonPath, 'utf-8');

export function testBasicFuncNameAndParams() {
  const result = toWrapperSpawnConfig(targetScript, {funcName: 'add1', funcParams: ['10']});
  assert.strictEqual(result.command, 'ts-node');
  assert.ok(result.args.some(a => a.includes('index.ts')));
  assert.ok((result.spawnOptions.stdio as any[]).includes('ipc'));
  assert.strictEqual(result.infoToCp.targetScript, path.resolve(process.cwd(), targetScript));
  assert.strictEqual(result.infoToCp.runTargetScriptOptions.funcName, 'add1');
  assert.deepStrictEqual(result.infoToCp.runTargetScriptOptions.funcParams, ['10']);
  console.log('PASS: testBasicFuncNameAndParams');
}

export function testFuncNameOnlyEmptyParams() {
  const result = toWrapperSpawnConfig(targetScript, {funcName: 'add2', funcParams: []});
  assert.strictEqual(result.infoToCp.runTargetScriptOptions.funcName, 'add2');
  console.log('PASS: testFuncNameOnlyEmptyParams');
}

export function testNoFuncName() {
  const result = toWrapperSpawnConfig(targetScript, {funcName: undefined, funcParams: ['5']});
  assert.strictEqual(result.infoToCp.runTargetScriptOptions.funcName, undefined);
  console.log('PASS: testNoFuncName');
}

export function testWithConfigFile() {
  const configFile = path.join(__dirname, '../project/run-export.config.js');
  const result = toWrapperSpawnConfig(targetScript, {
    funcName: 'add1',
    funcParams: ['10'],
    options: {configFile},
  });
  const expectedPreScript = path.join(__dirname, '../project/set-env.ts');
  assert.strictEqual(result.infoToCp.preScript, expectedPreScript);
  assert.strictEqual(result.infoToCp.runTargetScriptOptions.funcName, 'add1');
  assert.deepStrictEqual(result.infoToCp.runTargetScriptOptions.funcParams, ['10']);
  console.log('PASS: testWithConfigFile');
}

export function testEsmPackage() {
  fs.writeFileSync(pkgJsonPath, JSON.stringify({type: 'module'}));
  try {
    const result = toWrapperSpawnConfig(targetScript, {funcName: 'add1', funcParams: []});
    assert.strictEqual(result.command, 'tsx');
  } finally {
    fs.writeFileSync(pkgJsonPath, originalPkgJson);
  }
  console.log('PASS: testEsmPackage');
}

export function testJsBasicFuncNameAndParams() {
  const result = toWrapperSpawnConfig(targetScriptJs, {funcName: 'add1', funcParams: ['10']});
  assert.ok(result.args.some(a => a.includes('index.js')));
  assert.ok((result.spawnOptions.stdio as any[]).includes('ipc'));
  assert.strictEqual(result.infoToCp.targetScript, path.resolve(process.cwd(), targetScriptJs));
  assert.strictEqual(result.infoToCp.runTargetScriptOptions.funcName, 'add1');
  assert.deepStrictEqual(result.infoToCp.runTargetScriptOptions.funcParams, ['10']);
  console.log('PASS: testJsBasicFuncNameAndParams');
}

export function testJsWithConfigFile() {
  const configFile = path.join(__dirname, '../project/run-export.config.js');
  const result = toWrapperSpawnConfig(targetScriptJs, {
    funcName: 'add1',
    funcParams: ['10'],
    options: {configFile},
  });
  const expectedPreScript = path.join(__dirname, '../project/set-env.ts');
  assert.strictEqual(result.infoToCp.preScript, expectedPreScript);
  assert.strictEqual(result.infoToCp.runTargetScriptOptions.funcName, 'add1');
  assert.deepStrictEqual(result.infoToCp.runTargetScriptOptions.funcParams, ['10']);
  console.log('PASS: testJsWithConfigFile');
}

testBasicFuncNameAndParams();
testFuncNameOnlyEmptyParams();
testNoFuncName();
testWithConfigFile();
testEsmPackage();
testJsBasicFuncNameAndParams();
testJsWithConfigFile();
console.log('All tests passed');
