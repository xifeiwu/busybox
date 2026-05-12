import {Command, Option} from 'commander';
import type {ListProcKeyInfoOptions, StartProcOptions} from '../../modules/lib/node/lib/process-manager';
import {logColorful} from '../service/external';
import {list, info, detail, start, stop, restart, clean, log} from './service';

const program = new Command();
program.name('pm').description('manage child processes (process-manager)');

program
  .command('list')
  .description('list managed processes (same layout as process-manager registry)')
  .addOption(
    new Option('-f, --filter <status>', 'restrict rows by process liveness')
      .choices(['all', 'running', 'dead'] as const)
      .default('all')
  )
  .action(async (opts: ListProcKeyInfoOptions) => {
    const rows = await list(opts);
    logColorful({}, rows);
  });

program
  .command('info [id]')
  .description('get process key info (getProcKeyInfo)')
  .action(async (id?: string) => {
    const {cpId, info: procInfo} = await info(id);
    if (!procInfo) {
      logColorful({color: 'yellow'}, `No info file for process: ${cpId}`);
      return;
    }
    logColorful({}, procInfo);
  });

program
  .command('detail [id]')
  .description('read persisted process info (readProcInfo)')
  .action(async (id?: string) => {
    const {cpId, info: procInfo} = await detail(id);
    if (!procInfo) {
      logColorful({color: 'yellow'}, `No info file for process: ${cpId}`);
      return;
    }
    logColorful({}, procInfo);
  });

program
  .command('start [id]')
  .description(
    'start a process from src/2-cp-script config (default mode: monitored if entry has monitorConfig, else detached)'
  )
  .addOption(
    new Option('-m, --mode <mode>', 'how to launch the child process').choices([
      'detached',
      'monitored',
    ] as const)
  )
  .action(async (id: string | undefined, opts: Pick<StartProcOptions, 'mode'>) => {
    const startOpts: StartProcOptions | undefined = opts.mode != null ? {mode: opts.mode} : undefined;
    const {cpId, result} = await start(id, startOpts);
    logColorful({}, `Process ${cpId} started.`);
    logColorful({}, result);
  });

program
  .command('stop [id]')
  .description('stop one process (interactive pick matches list)')
  .option('-c, --clean', 'remove process base folder after stop')
  .action(async (id: string | undefined, opts: {clean?: boolean}) => {
    const {cpId, killedPids, cleaned} = await stop(id, Boolean(opts.clean));
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
    const {cpId, result} = await restart(id, Boolean(opts.clean));
    logColorful({}, `Process ${cpId} restarted.`);
    logColorful({}, result);
  });

program
  .command('clean [id]')
  .description('kill process and remove its info and log files')
  .action(async (id?: string) => {
    const {cpId} = await clean(id);
    logColorful({color: 'yellow'}, `Cleaned up info and log for ${cpId}.`);
  });

program
  .command('log [id]')
  .description('follow stdout log for a process (interactive pick matches list)')
  .action(async (id?: string) => {
    await log(id);
  });

program.parse(process.argv);
