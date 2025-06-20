#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {getTsParams, goOnOrNot, logColorful, makeSureDirExistForFile} from '../modules/lib/node';

const BASE_DIR = __dirname;
const DIST_DIR = path.join(__dirname, 'dist');

/**
 * Command can run directly
 */
const commonCommand = {
  /** run exported functions from .ts file */
  runTsExport: 'runTsExport.ts',
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
};

/**
 * For some command, it's content is based on it's locate and platform os reside on
 * So it's content is regenerated here
 */
function generateCommand(binDir: string) {
  /**
   * shebangline not support very well on every platform, such as centos not support param in shebangline line
   * create run-on-ts-node.sh, use run-on-ts-node.sh as shebangline command for .ts command
   */
  const tsParams = getTsParams(__filename, {
    tsNodeOptions: {
      '--swc': true,
    },
  });
  const bashCmd = ['ts-node', ...tsParams, `"$@"`].join(' ');
  const runnerContent = ['#!/bin/sh', 'echo ' + bashCmd, bashCmd];
  const runnerFilePath = path.join(DIST_DIR, 'run-on-ts-node.sh');
  makeSureDirExistForFile(runnerFilePath);
  fs.writeFileSync(runnerFilePath, runnerContent.join('\n'));
  fs.chmodSync(runnerFilePath, '755');
  logColorful({color: 'green'}, `Created File: ${runnerFilePath}`);

  for (const [, basename] of Object.entries(commandToUpdate)) {
    const scriptFilePath = path.join(BASE_DIR, basename);
    const scriptContent = fs.readFileSync(scriptFilePath);
    const firstLine = `#!${runnerFilePath}`;
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

  generateCommand(binDir);
  linkCommand(binDir);
});

program.parse(process.argv);
