#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import {Command} from 'commander';

const bin = {
  runTsExport: 'runTsExport.ts',
  runOnTsNode: 'runOnTsNode.ts',
  nb: 'nb.ts',
  'nb-process': 'nb-process.ts',
  'nb-net': 'nb-net.ts',
  'login-to-server': 'login-to-server.ts',
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
    const linkFile = path.resolve(binDir, binName);
    if (linkeFileExist(linkFile)) {
      fs.unlinkSync(linkFile);
      console.log(`remove: ${linkFile}`);
    }
    fs.symlinkSync(targetFile, linkFile);
    console.log(`link: ${binName} -> ${targetFile}`);
  }
});

program.parse(process.argv);
