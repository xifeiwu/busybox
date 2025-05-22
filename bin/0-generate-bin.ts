#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {getTsParams, goOnOrNot, logColorful} from '../modules/lib/node';

const BASE_DIR = __dirname;

const commandToLink = {
  /** run exported functions from .ts file */
  runTsExport: 'runTsExport.ts',
  runJsExport: 'runJsExport.js',
  /** run target file on ts-node */
  runOnTsNode: 'runOnTsNode.ts',
  'login-to-server': 'login-to-server.ts',
  'http-server': 'http-server.ts',
  /** start tcp gateway and service behind tcp gateway */
  'tcp-gateway': 'tcp-gateway.ts',
  'syncup-gitmodules': 'syncup-gitmodules.ts',
};
const commandToUpdate = {
  /** node tools */
  nb: 'nb.ts',
  /** start daemon for child process */
  daemon: 'daemon.ts',
};

type CommandName = keyof typeof commandToLink;

function appendShebangLine(command: CommandName) {
  const daemonScriptPath = path.resolve(BASE_DIR, commandToLink[command]);
  const tsParams = getTsParams(daemonScriptPath, {
    tsNodeOptions: {
      '--swc': true,
    },
  });
  const firstLine = ['#!/usr/bin/env ts-node', ...tsParams].join(' ');
  const scriptContent = fs.readFileSync(daemonScriptPath);
  const lines = scriptContent.toString().split('\n');
  if (lines[0].startsWith('#!')) {
    lines[0] = firstLine;
  } else {
    lines.unshift(firstLine);
  }
  fs.writeFileSync(daemonScriptPath, lines.join('\n'));
  fs.chmodSync(daemonScriptPath, '755');
}

function preHandleComand() {
  for (const command of ['daemon', 'nb']) {
    appendShebangLine(command as CommandName);
  }
}

function copyCommand(binDir: string) {
  /**
   * create run-on-ts-node.sh, and run .ts file by run-on-ts-node.sh
   * To solve the issue, on some platform(such as centos), shebangline not support very well
   */
  const tsParams = getTsParams(__filename, {
    tsNodeOptions: {
      '--swc': true,
    },
  });
  const bashCmd = ['ts-node', ...tsParams, `"$@"`].join(' ');
  const runnerContent = ['#!/bin/sh', 'echo ' + bashCmd, bashCmd];
  const runnerFilePath = path.join(BASE_DIR, 'run-on-ts-node.sh');
  fs.writeFileSync(runnerFilePath, runnerContent.join('\n'));
  fs.chmodSync(runnerFilePath, '755');
  logColorful({color: 'green'}, `Created File: ${runnerFilePath}`);

  for (const [command, basename] of Object.entries(commandToUpdate)) {
    const scriptFilePath = path.resolve(BASE_DIR, basename);
    const scriptContent = fs.readFileSync(scriptFilePath);
    // const binFilePath = path.resolve(binDir, command);
    // if (isLinkFileExist(binFilePath)) {
    //   fs.unlinkSync(binFilePath);
    //   logColorful({}, `Unlink file: ${binFilePath}`);
    // }
    const firstLine = `#!${runnerFilePath}`;
    const lines = scriptContent.toString().split('\n');
    if (lines[0].startsWith('#!')) {
      lines[0] = firstLine;
    } else {
      lines.unshift(firstLine);
    }
    fs.writeFileSync(scriptFilePath, lines.join('\n'));
    fs.chmodSync(scriptFilePath, '755');
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
  for (const [binName, scriptName] of Object.entries({...commandToLink, ...commandToUpdate})) {
    // link can't be overrided, so remove it first
    const linkFile = path.resolve(binDir, binName);
    if (isLinkFileExist(linkFile)) {
      fs.unlinkSync(linkFile);
      logColorful({}, `Unlink file: ${linkFile}`);
    }
    if (!scriptName) {
      continue;
    }
    const targetFile = path.resolve(BASE_DIR, scriptName);
    if (!fs.existsSync(targetFile)) {
      console.error(`File not exist: ${targetFile}`);
      continue;
    }
    const relativePath = path.relative(path.dirname(linkFile), targetFile);
    fs.symlinkSync(relativePath, linkFile);
    logColorful({color: 'green'}, `Created Link: ${linkFile} -> ${targetFile}`);
  }
  logColorful({color: 'red'}, `export PATH=${binDir}:$PATH`);
}

const program = new Command();
program.argument('[targetDir] dir to locate the bin').action(async binDir => {
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

  copyCommand(binDir);
  linkCommand(binDir);
});

program.parse(process.argv);
