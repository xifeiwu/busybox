import {Command} from 'commander';
import {appendFileCommand} from './file';
import {appendNetCommand} from './net';
import {appendProcessCommand} from './process';
import {appendOtherCommand} from './others';

const program = new Command();
program
  .name('nb')
  .description('busybox on node')
  .command('process', 'handle process', {executableFile: 'process.ts'});

appendFileCommand(program);
appendNetCommand(program);
appendProcessCommand(program);
appendOtherCommand(program);

program.parse(process.argv);
