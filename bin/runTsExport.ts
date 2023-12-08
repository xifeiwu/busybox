#!/usr/bin/env ts-node
import path from 'path';
import {spawn} from 'child_process';

async function start() {
  const childProcess = spawn(
    'ts-node',
    [
      '-r',
      path.resolve(__dirname, '../../node_modules/tsconfig-paths/register.js'),
      '--project',
      path.resolve(__dirname, '../../tsconfig.json'),
      path.resolve(__dirname, 'start.ts')
    ],
    {stdio: ['pipe', 'pipe', 'pipe']}
  );

  childProcess.stdout.pipe(process.stdout, {end: false});
  childProcess.stderr.pipe(process.stderr, {end: false});
}
start();