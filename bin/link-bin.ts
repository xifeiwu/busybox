#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import {Command} from 'commander';

const bin = {
  runTsExport: 'runTsExport.ts',
  runJsExport: 'runJsExport.js',
  runOnTsNode: 'runOnTsNode.ts',
  nb: 'nb.ts',
  'login-to-server': 'login-to-server.ts',
  'http-server': 'http-server.ts',
  'tcp-gateway': 'tcp-gateway.ts',
  daemon: 'daemon.ts',
};

function linkeFileExist(filePath) {
  try {
    if (fs.lstatSync(filePath)) {
      return true;
    }
  } catch {
    return false;
  }
}

const program = new Command();
program.argument('[targetDir] dir to locate the bin').action(async binDir => {
  if (!binDir) {
    const {HOME} = process.env;
    binDir = path.resolve(HOME, 'code/bin');
  }
  console.log(`will create link under dir ${binDir}`);

  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, {recursive: true});
  }
  for (const [binName, relatePath] of Object.entries(bin)) {
    const targetFile = path.resolve(__dirname, relatePath);
    if (!fs.existsSync(targetFile)) {
      console.error(`File not exist: ${targetFile}`);
      continue;
    }
    const linkFile = path.resolve(binDir, binName);
    const relativePath = path.relative(path.dirname(linkFile), targetFile);
    // console.log(linkFile);
    // console.log(targetFile);
    // console.log(relativePath);
    // console.log();
    if (linkeFileExist(linkFile)) {
      fs.unlinkSync(linkFile);
      console.log(`remove: ${linkFile}`);
    }
    fs.symlinkSync(relativePath, linkFile);
    console.log(`link: ${binName} -> ${targetFile}`);
  }
  console.log(`export PATH=${binDir}:$PATH`);
});

program.parse(process.argv);
