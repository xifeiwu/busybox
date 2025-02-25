#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {convertToBuffer, getTsParams, goOnOrNot, logColorful, makeSureDirExist} from '../modules/lib/node';

const BASE_DIR = __dirname;

const commandToLink = {
  runTsExport: 'runTsExport.ts',
  runJsExport: 'runJsExport.js',
  runOnTsNode: 'runOnTsNode.ts',
  nb: 'nb.ts',
  'login-to-server': 'login-to-server.ts',
  'http-server': 'http-server.ts',
  'tcp-gateway': 'tcp-gateway.ts',
  daemon: 'daemon.ts',
  'syncup-gitmodules': 'syncup-gitmodules.ts',
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
  if (lines[0].startsWith('#!/usr/bin/env')) {
    lines[0] = firstLine;
  } else {
    lines.unshift(firstLine);
  }
  fs.writeFileSync(daemonScriptPath, lines.join('\n'));
  fs.chmodSync(daemonScriptPath, '755');
}

function preHandleComand(command: CommandName) {
  for (const command of ['daemon', 'nb'] as CommandName[]) {
    appendShebangLine(command);
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
function linkFile(binDir: string) {
  for (const [binName, scriptName] of Object.entries(commandToLink)) {
    // link can't be overrided, so remove it first
    const linkFile = path.resolve(binDir, binName);
    if (isLinkFileExist(linkFile)) {
      fs.unlinkSync(linkFile);
      console.log(`Remove: ${linkFile}`);
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
    console.log(`Created Link: ${linkFile} -> ${targetFile}`);
  }
  console.log(`export PATH=${binDir}:$PATH`);
}

const program = new Command();
program.argument('[targetDir] dir to locate the bin').action(async binDir => {
  if (!binDir) {
    const {HOME} = process.env;
    binDir = path.resolve(HOME, 'code/bin');
  }
  // console.log(`will create link under dir ${binDir}`);
  logColorful({color: 'red'}, ``);
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
  preHandleComand(binDir);
  linkFile(binDir);
});

program.parse(process.argv);
