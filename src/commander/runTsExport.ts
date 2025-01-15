import fs from 'fs';
import path from 'path';
import readline from 'readline';
import {Command} from 'commander';
import {logColorful} from '../service/external';

function isObject(val: any) {
  return val !== null && typeof val === 'object';
}

function isFunction(val: any) {
  const toString = Object.prototype.toString;
  const toStr = toString.call(val);
  return toStr === '[object Function]' || toStr === '[object AsyncFunction]';
}

function isAsyncFunction(val: any) {
  const toString = Object.prototype.toString;
  const toStr = toString.call(val);
  return toStr === '[object AsyncFunction]';
}

export function selectOption<T extends {label: string}>(
  options: T[],
  option?: {
    tip?: string;
    defaultIndex?: number;
  }
): Promise<T> {
  const {tip = 'please select', defaultIndex = 0} = option ? option : {};
  const optionStr = options
    .map((it, index) => {
      return `${index}. ${String(it.label ? it.label : it)}`;
    })
    .concat(`${tip}(default index is ${defaultIndex}): `)
    .join('\n');
  const interact = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((res, rej) => {
    interact.question(optionStr, answer => {
      let index = parseInt(answer);
      if (Number.isNaN(index)) {
        index = defaultIndex;
      }
      if (!options[index]) {
        rej(`index ${index} does not existed in options`);
      } else {
        res(options[index]);
      }
      interact.close();
    });
  });
}

async function getFunctionName(funcNameList: string[], funcName?: string) {
  if (!Array.isArray(funcNameList) || funcNameList.length === 0) {
    throw new Error(`funcNameList not exist or is empty array`);
  }
  let result = funcName;
  if (!funcName || !funcNameList.includes(funcName)) {
    if (funcNameList.length === 1) {
      result = funcNameList[0];
    } else {
      const {label} = await selectOption(
        funcNameList.map(it => {
          return {
            label: it,
          };
        }),
        {
          tip: 'please select function name',
        }
      );
      result = label;
    }
  }
  return result;
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
  const funcName = await getFunctionName(functionList, funcName_);
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
  .option('-s, --seleect', 'select the process to kill when more than on process exist')
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
        const functionList = Object.keys(Module).filter(name => isFunction(Module[name]));
        if (all) {
          for (const it of functionList) {
            logColorful({color: 'yellow'}, `Running function: ${it}`);
            const func = Module[it];
            result = await runFunction(func, funcParams);
          }
        } else {
          funcName = await getFunctionName(functionList, funcName);
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