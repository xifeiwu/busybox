import {Command} from 'commander';
import {logColorful} from '../service/external';
import {
  listProcessesKeyInfo,
  infoProcess,
  startProcess,
  stopProcess,
  restartProcess,
  cleanupProc,
  logProcess,
} from './service';

const program = new Command();
program.name('pm').description('manage child processes (process-manager)');

program
  .command('list')
  .description('list all managed processes (same layout as process-manager registry)')
  .action(async () => {
    const rows = await listProcessesKeyInfo();
    logColorful({}, rows);
  });

program
  .command('info [id]')
  .description('read persisted process info (readProcInfo)')
  .action(async (id?: string) => {
    const info = await infoProcess(id);
    if (!info) {
      logColorful({color: 'yellow'}, 'No info file found.');
      return;
    }
    logColorful({}, info);
  });

program
  .command('start [id]')
  .description('start a process from src/2-process config (monitored if entry has monitorConfig)')
  .action(async (id?: string) => {
    const result = await startProcess(id);
    logColorful({}, result);
  });

program
  .command('stop [id]')
  .description('stop one process (interactive pick matches list)')
  .option('-c, --clean', 'remove process base folder after stop')
  .action(async (id: string | undefined, opts: {clean?: boolean}) => {
    const {cpId, killedPids, cleaned} = await stopProcess(id, Boolean(opts.clean));
    if (killedPids.length === 0) {
      logColorful({color: 'yellow'}, `Process ${cpId} is not running.`);
    } else {
      logColorful({}, `Process ${cpId} stopped.`);
    }
    if (cleaned) {
      logColorful({}, `Removed base folder for ${cpId}.`);
    }
  });

program
  .command('restart [id]')
  .description('stop then start one process (interactive pick matches list)')
  .option('-c, --clean', 'remove process base folder before start')
  .action(async (id: string | undefined, opts: {clean?: boolean}) => {
    const result = await restartProcess(id, Boolean(opts.clean));
    logColorful({}, result);
  });

program
  .command('cleanup [id]')
  .description('kill process and remove its info and log files')
  .action(async (id?: string) => {
    const {cpId} = await cleanupProc(id);
    logColorful({}, `Cleaned up info and log for ${cpId}.`);
  });

program
  .command('log [id]')
  .description('follow stdout log for a process (interactive pick matches list)')
  .action(async (id?: string) => {
    await logProcess(id);
  });

program.parse(process.argv);
