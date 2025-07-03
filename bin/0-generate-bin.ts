#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {
  getTsParams,
  goOnOrNot,
  logColorful,
  makeSureDirExistForFile,
  selectOption,
} from '../modules/lib/node';

const BASE_DIR = __dirname;
const DIST_DIR = path.join(__dirname, 'dist');

/**
 * Command can run directly
 */
const commonCommand = {
  /** run exported functions from .ts file */
  runJsExport: 'runJsExport.js',
  /** run target file on ts-node */
  runOnTsNode: 'runOnTsNode.ts',
  'login-to-server': 'login-to-server.ts',
  'http-server': 'http-server.ts',
  'syncup-gitmodules': 'syncup-gitmodules.ts',
};
/**
 * Command related with file locate and distro os reside on
 */
const commandToUpdate = {
  /** node tools */
  nb: 'nb.ts',
  /** start daemon for child process */
  daemon: 'daemon.ts',
  /** start tcp gateway and service behind tcp gateway */
  'tcp-gateway': 'tcp-gateway.ts',
  runTsExport: 'runTsExport.ts',
};

type ShebangType = 'shell' | 'ts-node';
const shebangTypeList: ShebangType[] = ['shell', 'ts-node'];
async function getShebangType(shebangType?: ShebangType) {
  if (!shebangTypeList.includes(shebangType)) {
    const {label} = await selectOption(
      shebangTypeList.map(it => ({label: it})),
      {defaultAnswer: 'ts-node'}
    );
    return label;
  }
  return shebangType;
}
/**
 * Generate final command to run
 * As for .ts file that run on ts-node, some params of ts-node are must to have, say -r, --project, and their value depends on the project location
 * And also, shebangline not support very well on some platform, say, centos not support param for runtime
 * We need to generate final command dynamically by script
 *
 * To get bin command that can run on centos, create run-on-ts-node.sh, use run-on-ts-node.sh as shebangline command for .ts command
 */
async function generateFinalCommand(shebangType?: ShebangType) {
  shebangType = await getShebangType(shebangType);
  // -r /Users/wuxifei/code/node/tool/busybox/node_modules/tsconfig-paths/register.js --project /Users/wuxifei/code/node/tool/busybox/tsconfig.json --swc
  const tsParams = getTsParams(__filename, {
    tsNodeOptions: {
      '--swc': true,
    },
  });
  let firstLine: string;
  if (shebangType === 'shell') {
    const bashCmd = ['ts-node', ...tsParams, `"$@"`].join(' ');
    const runnerContent = ['#!/bin/sh', 'echo ' + bashCmd, bashCmd];
    const runnerFilePath = path.join(DIST_DIR, 'run-on-ts-node.sh');
    makeSureDirExistForFile(runnerFilePath);
    fs.writeFileSync(runnerFilePath, runnerContent.join('\n'));
    fs.chmodSync(runnerFilePath, '755');
    logColorful({color: 'green'}, `Created File: ${runnerFilePath}`);
    firstLine = `#!${runnerFilePath}`;
  } else if (shebangType === 'ts-node') {
    firstLine = ['#!/usr/bin/env', 'ts-node', ...tsParams].join(' ');
  } else {
    throw new Error('Shebangline type is not provided.');
  }

  for (const [, basename] of Object.entries(commandToUpdate)) {
    const scriptFilePath = path.join(BASE_DIR, basename);
    const scriptContent = fs.readFileSync(scriptFilePath);
    const lines = scriptContent.toString().split('\n');
    if (lines[0].startsWith('#!')) {
      lines[0] = firstLine;
    } else {
      lines.unshift(firstLine);
    }
    const outputFilePath = path.join(DIST_DIR, basename);
    fs.writeFileSync(outputFilePath, lines.join('\n'));
    fs.chmodSync(outputFilePath, '755');
    logColorful({color: 'green'}, `Updated File: ${scriptFilePath}`);
  }
}

function isLinkFileExist(filePath) {
  try {
    if (fs.lstatSync(filePath)) {
      return true;
    }
  } catch {
    return false;
  }
}
function linkCommand(binDir: string) {
  const binNametoFullpath: Record<string, string> = {};
  for (const [binName, scriptName] of Object.entries(commonCommand)) {
    binNametoFullpath[binName] = path.join(BASE_DIR, scriptName);
  }
  for (const [binName, scriptName] of Object.entries(commandToUpdate)) {
    binNametoFullpath[binName] = path.join(DIST_DIR, scriptName);
  }

  for (const [binName, fullPath] of Object.entries(binNametoFullpath)) {
    // link can't be overrided, so remove it first
    const linkFile = path.resolve(binDir, binName);
    if (isLinkFileExist(linkFile)) {
      fs.unlinkSync(linkFile);
      logColorful({}, `Unlink file: ${linkFile}`);
    }
    if (!fs.existsSync(fullPath)) {
      console.error(`File not exist: ${fullPath}`);
      continue;
    }
    const relativePath = path.relative(path.dirname(linkFile), fullPath);
    fs.symlinkSync(relativePath, linkFile);
    logColorful({color: 'green'}, `Created Link: ${linkFile} -> ${fullPath}`);
  }
  logColorful({color: 'red'}, `export PATH=${binDir}:$PATH`);
}

const program = new Command();
program
  .command('generate')
  .description('generate bin command')
  .action(async () => {
    await generateFinalCommand();
  });

program
  .command('link [binDir]')
  .description('generate and link bin command')
  .action(async binDir => {
    if (!binDir) {
      const {HOME} = process.env;
      binDir = path.resolve(HOME, 'code/bin');
    }
    if (
      !(await goOnOrNot({
        tips: [`Will create command to dir: ${binDir}`],
        defaultValue: true,
        style: {
          color: 'red',
        },
      }))
    ) {
      throw new Error(`Manually Interupt`);
    }

    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, {recursive: true});
    }
    await new Promise(res => process.nextTick(res));

    await generateFinalCommand();
    linkCommand(binDir);
  });

program.parse(process.argv);
