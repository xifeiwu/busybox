#!/usr/bin/env ts-node
import path from 'path';
import {spawnTsFile} from '../modules/lib/node';

async function start() {
  const argv = process.argv;
  process.stdin.setRawMode(false);
  const childProcess = spawnTsFile(path.resolve(__dirname, '../src/commander/tcp-gateway.ts'), {
    printCommand: true,
    params: argv.length > 2 ? argv.slice(2) : [],
    spawnOptions: {stdio: [0, 1, 2]},
  });
  childProcess.on('exit', () => {
    process.stdin.setRawMode(true);
  });
}

start();
