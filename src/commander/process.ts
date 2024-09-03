import {Command} from 'commander';
import {
  getAllProcessInfo,
  selectProcessToKill,
  logColorful,
  getProcessInfoByPort,
  toConsole,
  getProcessTree,
  ProcessInfoWithChildren,
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
    const info = await getProcessTree(pid);
    logColorful({color: 'black'}, info);
  });
program
  .command('killByPid')
  .argument('<pid>', 'pid of process')
  .action(async pid => {
    function killByPid(info: ProcessInfoWithChildren) {
      const {pid, children} = info;
      if (Array.isArray(children)) {
        children.forEach(killByPid);
      }
      process.kill(Number(pid));
    }
    const info = await getProcessTree(pid);
    if (!info) {
      throw new Error(`No process with pid ${pid}`);
    }
    killByPid(info);
  });
program
  .command('infoByCommand')
  .argument('<cmdText>', 'cmdText of process')
  .action(async cmdText => {
    /** Ignore current process */
    const pidIgnore = [process.pid, process.ppid];
    const info = await getAllProcessInfo({
      filter: info => {
        if (!info) {
          return false;
        }
        const {command, pid} = info;
        if (!command) {
          return false;
        }
        if (pidIgnore.includes(Number(pid))) {
          return false;
        }
        return info.command && info.command.includes(cmdText);
      },
    });
    logColorful({color: 'black'}, info);
  });

program
  .command('killByCommand')
  .argument('<cmdText>', 'cmdText of process')
  .action(async cmdText => {
    /** Ignore current process */
    const pidIgnore = [process.pid, process.ppid];
    const info = await getAllProcessInfo({
      filter: info => {
        if (!info) {
          return false;
        }
        const {command, pid} = info;
        if (!command) {
          return false;
        }
        if (pidIgnore.includes(Number(pid))) {
          return false;
        }
        return info.command && info.command.includes(cmdText);
      },
    });
    logColorful({color: 'black'}, info);
  });
// console.log(`process.argv1`);
// console.log(process.argv);
program.parse(process.argv);
