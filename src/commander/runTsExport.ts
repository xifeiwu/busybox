import fs from 'fs';
import path from 'path';
import readline from 'readline';

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

(async () => {
  const {argv} = process;
  console.log(`argv`);
  console.log(argv);
  /**
   * 前两个参数分别为node和当前脚本
   * ['/Applications/node/.nvm/versions/node/v12.12.0/bin/node', '/Applications/node/.nvm/versions/node/v12.12.0/bin/nrun']
   */
  const params = argv.slice(2);
  try {
    if (params.length === 0) {
      throw new Error(`usage: run target.js functionNameOfModule`);
    }
    const [relativePathOfFile, ...functionAndParams] = params;
    const fullPath = path.resolve(process.cwd(), relativePathOfFile);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`file ${fullPath} not exist`);
    }
    const Module = require(fullPath);
    let funcName = '';
    let res: any = undefined;
    if (isObject(Module)) {
      // 通过module.exports.chain = function() {}导出模块
      const functionList = Object.keys(Module).filter(name => isFunction(Module[name]));
      const [funcName_, ...params] = functionAndParams;
      funcName = await getFunctionName(functionList, funcName_);
      const func = Module[funcName];
      res = await runFunction(func, params);
    } else if (isFunction(Module)) {
      // TODO: logic rarely arrive here
      res = await handleClass(Module, functionAndParams);
    } else {
      throw new Error(`${Module} is not a class`);
    }
    console.log('');
    console.log(TAG + ` [${funcName}]`);
    console.log(res);
    console.log('------');
  } catch (err) {
    console.error(err);
    throw err;
  }
})();
