#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
const {HOME} = process.env;
const binDir = path.resolve(HOME, 'code/bin');
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
async function start() {
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
}

start();
