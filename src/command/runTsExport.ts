import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {logColorful, goOnOrNot, selectOption, isNumber, isObject, isFunction} from '../service/external';
import {isAsyncFunction} from 'util/types';

const RUN_ALL_EXPORTED_FUNCTIONS = '_all';

/**
 * If funcNameList.length is
 */
async function getFunctionToRun(funcNameList: string[], funcName?: string) {
  if (!Array.isArray(funcNameList) || funcNameList.length === 0) {
    throw new Error(`funcNameList length is zero`);
  }
  const allFuncNames = [...funcNameList, RUN_ALL_EXPORTED_FUNCTIONS];
  if (allFuncNames.includes(funcName)) {
    return funcName;
  }
  if (funcNameList.length === 1) {
    return funcNameList[0];
  }

  const {label, answer} = await selectOption(
    allFuncNames.map(it => {
      return {
        label: it,
      };
    })
  );
  funcName = label;
  /** Double confirm if function name is selected by option index */
  if (
    isNumber(answer) &&
    !(await goOnOrNot({
      style: {
        color: 'red',
      },
      tips: [`run function ${funcName}?`],
      defaultValue: true,
    }))
  ) {
    throw new Error(`Manually Interrupt`);
  }
  return funcName;
}

const TAG = 'OUT_OF_FUNCTION';

async function runFunction(func: (arg0: any) => any, params: any) {
  let res: any = undefined;
  if (isAsyncFunction(func)) {
    res = await func.apply(null, params);
  } else {
    res = func.apply(null, params);
  }
  return res;
}
/**
 * class Module{} 通过module.exports=Module导出模块
 */
async function handleClass(Module: {new (): any; prototype: any}, functionAndParams: any[]) {
  const functionList = Object.getOwnPropertyNames(Module.prototype)
    .filter(it => !it.startsWith('_'))
    .filter(it => ['constructor'].indexOf(it) === -1);
  const [funcName_, ...params] = functionAndParams;
  const funcName = await getFunctionToRun(functionList, funcName_);
  const target = new Module();
  const func = target[funcName].bind(target);
  return await runFunction(func, params);
}

const program = new Command();
program.name('runTsExport').description('utility for process handling');
program
  .argument('<tsFilePath>', 'path to ts file to run')
  .argument('[funcName]', 'name of function')
  .argument('[funcParams...]', 'params passed to the function')
  .option('-a, --all', 'run all exported function')
  .option('-d, --dry-run', 'show the command without running it. ')
  .action(async (tsFilePath, funcName, funcParams, options) => {
    const {all, select} = options;
    try {
      const fullPath = path.resolve(process.cwd(), tsFilePath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`file ${fullPath} not exist`);
      }
      const Module = require(fullPath);
      let result: any = undefined;
      if (isObject(Module)) {
        // 通过module.exports.chain = function() {}导出模块
        const funcNameList = Object.keys(Module).filter(name => isFunction(Module[name]));
        if (!Array.isArray(funcNameList) || funcNameList.length === 0) {
          logColorful({color: 'red'}, `No function is exported from file ${fullPath}`);
          return;
        }
        funcName = await getFunctionToRun(funcNameList, funcName);
        if (all || funcName === RUN_ALL_EXPORTED_FUNCTIONS) {
          for (const it of funcNameList) {
            logColorful({color: 'yellow'}, `Running function: ${it}`);
            const func = Module[it];
            result = await runFunction(func, funcParams);
          }
        } else {
          const func = Module[funcName];
          result = await runFunction(func, funcParams);
        }
      } else if (isFunction(Module)) {
        // TODO: logic rarely arrive here
        result = await handleClass(Module, [funcName, ...funcParams]);
      } else {
        throw new Error(`${Module} is not a class`);
      }
      console.log('');
      console.log(TAG + ` [${funcName}]`);
      console.log(result);
      console.log('------');
    } catch (err) {
      console.log(`${TAG} catch Error:`);
      console.error(err);
      throw err;
    }
  });
program.parse(process.argv);
// remove this logic as it will block process
// process.stdin.on('data', (chunk: Buffer) => {
//   // console.log(chunk);
// })
