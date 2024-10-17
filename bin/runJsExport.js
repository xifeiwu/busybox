#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectOption = selectOption;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const commander_1 = require("commander");
function isObject(val) {
    return val !== null && typeof val === 'object';
}
function isFunction(val) {
    const toString = Object.prototype.toString;
    const toStr = toString.call(val);
    return toStr === '[object Function]' || toStr === '[object AsyncFunction]';
}
function isAsyncFunction(val) {
    const toString = Object.prototype.toString;
    const toStr = toString.call(val);
    return toStr === '[object AsyncFunction]';
}
function selectOption(options, option) {
    const { tip = 'please select', defaultIndex = 0 } = option ? option : {};
    const optionStr = options
        .map((it, index) => {
        return `${index}. ${String(it.label ? it.label : it)}`;
    })
        .concat(`${tip}(default index is ${defaultIndex}): `)
        .join('\n');
    const interact = readline_1.default.createInterface({
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
            }
            else {
                res(options[index]);
            }
            interact.close();
        });
    });
}
async function getFunctionName(funcNameList, funcName) {
    if (!Array.isArray(funcNameList) || funcNameList.length === 0) {
        throw new Error(`funcNameList not exist or is empty array`);
    }
    let result = funcName;
    if (!funcName || !funcNameList.includes(funcName)) {
        if (funcNameList.length === 1) {
            result = funcNameList[0];
        }
        else {
            const { label } = await selectOption(funcNameList.map(it => {
                return {
                    label: it,
                };
            }), {
                tip: 'please select function name',
            });
            result = label;
        }
    }
    return result;
}
const TAG = 'OUT_OF_FUNCTION';
async function runFunction(func, params) {
    let res = undefined;
    if (isAsyncFunction(func)) {
        res = await func.apply(null, params);
    }
    else {
        res = func.apply(null, params);
    }
    return res;
}
/**
 * class Module{} 通过module.exports=Module导出模块
 */
async function handleClass(Module, functionAndParams) {
    const functionList = Object.getOwnPropertyNames(Module.prototype)
        .filter(it => !it.startsWith('_'))
        .filter(it => ['constructor'].indexOf(it) === -1);
    const [funcName_, ...params] = functionAndParams;
    const funcName = await getFunctionName(functionList, funcName_);
    const target = new Module();
    const func = target[funcName].bind(target);
    return await runFunction(func, params);
}
const program = new commander_1.Command();
program.name('runTsExport').description('utility for process handling');
program
    .argument('<tsFilePath>', 'path to ts file to run')
    .argument('[funcName]', 'name of function')
    .argument('[funcParams...]', 'params passed to the function')
    .option('-p, --print', 'print process info or not')
    .option('-s, --seleect', 'select the process to kill when more than on process exist')
    .action(async (tsFilePath, funcName, funcParams, options) => {
    const { print, select } = options;
    try {
        // const [relativePathOfFile, ...functionAndParams] = params;
        const fullPath = path_1.default.resolve(process.cwd(), tsFilePath);
        if (!fs_1.default.existsSync(fullPath)) {
            throw new Error(`file ${fullPath} not exist`);
        }
        const Module = require(fullPath);
        let result = undefined;
        if (isObject(Module)) {
            // 通过module.exports.chain = function() {}导出模块
            const functionList = Object.keys(Module).filter(name => isFunction(Module[name]));
            // const [funcName_, ...params] = functionAndParams;
            funcName = await getFunctionName(functionList, funcName);
            const func = Module[funcName];
            result = await runFunction(func, funcParams);
        }
        else if (isFunction(Module)) {
            // TODO: logic rarely arrive here
            result = await handleClass(Module, [funcName, ...funcParams]);
        }
        else {
            throw new Error(`${Module} is not a class`);
        }
        console.log('');
        console.log(TAG + ` [${funcName}]`);
        console.log(result);
        console.log('------');
    }
    catch (err) {
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
//# sourceMappingURL=runTsExport.js.map