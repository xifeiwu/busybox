import {Command} from 'commander';
import {getAllProcessInfo, killByPort, logWithColor} from '@modules/lib/node';

const program = new Command();

program.name('process').description('utility for process handling');

program
  .command('killByPort')
  .argument('<port>', 'the port')
  .option('-p, --print', 'print process info or not')
  .option('-s, --seleect', 'select the process to kill when more than on process exist')
  .action(async (port, options) => {
    const {print, select} = options;
    await killByPort(port, {
      printProcessInfo: print,
      selectProcessToKill: select,
    });
  });

program
  .command('infoByPid')
  .argument('<pid>', 'pid of process')
  .action(async pid => {
    const info = await getAllProcessInfo({filter: info => info.pid === pid});
    logWithColor('black', info);
  });
// console.log(`process.argv1`);
// console.log(process.argv);
program.parse(process.argv);
