import path from 'path';
import {Command} from 'commander';

const program = new Command();
program
  .name('nb')
  .description('busybox on node')
  .command('process', 'handle process', {executableFile: 'process.ts'});
  // path.resolve(__dirname, 'process.ts')
// console.log(`process.argv`);
// console.log(process.argv);
program.parse(process.argv);
