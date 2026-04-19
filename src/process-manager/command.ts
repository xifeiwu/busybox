import {Command} from 'commander';
import {
  listProcesses,
  infoProcess,
  startProcess,
  stopProcess,
  restartProcess,
  logProcess,
} from './service';

const program = new Command();
program.name('pm').description('manage child processes (process-manager)');

program
  .command('list')
  .description('list all managed processes (same layout as process-manager registry)')
  .action(async () => {
    await listProcesses();
  });

program
  .command('info [id]')
  .description('read persisted process info (readProcInfo)')
  .action(async (id?: string) => {
    await infoProcess(id);
  });

program
  .command('start [id]')
  .description('start a process from src/2-process-config (monitored if entry has monitorConfig)')
  .action(async (id?: string) => {
    await startProcess(id);
  });

program
  .command('stop [id]')
  .description('stop one process (interactive pick matches list)')
  .option('-c, --clean', 'remove process base folder after stop')
  .action(async (id: string | undefined, opts: {clean?: boolean}) => {
    await stopProcess(id, Boolean(opts.clean));
  });

program
  .command('restart [id]')
  .description('stop then start one process (interactive pick matches list)')
  .option('-c, --clean', 'remove process base folder before start')
  .action(async (id: string | undefined, opts: {clean?: boolean}) => {
    await restartProcess(id, Boolean(opts.clean));
  });

program
  .command('log [id]')
  .description('follow stdout log for a process (interactive pick matches list)')
  .action(async (id?: string) => {
    await logProcess(id);
  });

program.parse(process.argv);
