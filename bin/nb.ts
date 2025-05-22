#!/Users/wuxifei/code/node/tool/busybox/bin/run-on-ts-node.sh
import {Command} from 'commander';
import {
  appendFileCommand,
  appendNetCommand,
  appendProcessCommand,
  appendOtherCommand,
} from '../src/commander/nb';

const program = new Command();
program
  .name('nb')
  .description('busybox on node')
  .command('process', 'handle process', {executableFile: 'process.ts'});

appendFileCommand(program);
appendNetCommand(program);
appendProcessCommand(program);
appendOtherCommand(program);

const command = process.argv[2];
if (command === 'pretty-curl') {
  /** if command is pertty-curl, shift the command and pass the rest args to commander for parse and pretty curl command */
  const rest = process.argv.slice(3);
  program.parse([...process.argv.slice(0, 2), ...rest]);
} else {
  program.parse(process.argv);
}
