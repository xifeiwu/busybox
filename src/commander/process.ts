import {Command} from 'commander';
import {
  getAllProcessInfo,
  selectProcessToKill,
  logColorful,
  getProcessInfoByPort,
  toConsole,
} from '@modules/lib/node';

const program = new Command();

program.name('process').description('utility for process handling');

program
  .command('infoByPort')
  .argument('<port>', 'the port')
  .action(async (port, options) => {
    const processInfoList = await getProcessInfoByPort(port);
    toConsole(processInfoList);
  });
program
  .command('killByPort')
  .argument('<port>', 'the port')
  .option('-p, --print', 'print process info or not')
  .option('-s, --select', 'select the process to kill when more than on process exist')
  .action(async (port, options) => {
    const {print = true, select} = options;
    const processInfoList = await getProcessInfoByPort(port);
    await selectProcessToKill(processInfoList, {
      printProcessInfo: print,
      selectProcessToKill: select,
    });
  });

program
  .command('infoByPid')
  .argument('<pid>', 'pid of process')
  .action(async pid => {
    const info = await getAllProcessInfo({filter: info => info.pid === pid});
    logColorful({color: 'black'}, info);
  });
// console.log(`process.argv1`);
// console.log(process.argv);
program.parse(process.argv);
