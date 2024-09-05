import {Command} from 'commander';
import {
  getProcessInfo,
  logColorful,
  getProcessInfoByPort,
  ProcessFilter,
  getFilterFunc,
  ProcessInfoFilterFunc,
  killProcessByPid,
  ProcessInfo,
} from '@modules/lib/node';

export function appendProcessCommand(program: Command) {
  program
    .command('pinfo [pid]')
    .option('-i, --pid <pid>', 'pid filter')
    .option('-c, --cmd <command>', 'command filter')
    .option('-p, --port <port>', 'find process by port')
    .option('-k, --kill', 'kill processes filtered out')
    .action(async (argPid, options) => {
      // console.log(options);
      const {pid, cmd: command, port, tree, kill} = options;
      const filter: ProcessFilter = {pid: pid ? pid : argPid, command};
      const filterFunc = getFilterFunc(filter);

      let pInfoByPort: ProcessInfo[];
      if (port) {
        pInfoByPort = await getProcessInfoByPort(port);
      }
      const finalFilter: ProcessInfoFilterFunc = info => {
        if (port) {
          if (pInfoByPort.length === 0) {
            return false;
          }
          return Boolean(pInfoByPort.find(it => it.pid === info.pid));
        }
        const {pid, ppid} = process;
        return ![pid, ppid].includes(info.pid) && filterFunc(info);
      };
      const {allInfoList, pidToInfo} = await getProcessInfo({appendChildInfo: true});
      const filteredInfoList = allInfoList.filter(finalFilter);
      if (kill) {
        await killProcessByPid(
          filteredInfoList.map(it => it.pid),
          {pidToInfo, doubleConfirm: true}
        );
      } else {
        logColorful({color: 'black'}, filteredInfoList);
      }
    });
}
