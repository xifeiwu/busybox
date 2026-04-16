import {spawn} from 'child_process';
import {Command} from 'commander';
import {ping, info, start, restart, stop, startInDetachedMode, log} from './service';
import {logColorful, serializeSpawnResponse} from '../service/external';

const program = new Command();
program.name('daemon').description('daemon child process');

program
  .command('ping')
  .description('check if daemon is runing in background')
  .action(async () => {
    const result = await ping();
    logColorful({}, result);
  });
program
  .command('info [id]')
  .description('get info of all child process managed by daemon, or the distinct cp by if id provided')
  .action(async id => {
    const result = await info(id);
    logColorful({}, result);
  });
program
  .command('start [id]')
  .description('start daemon or child process managed by daemon')
  .action(async id => {
    const result = await start(id);
    logColorful({}, result);
  });

program
  .command('start-detach [id]')
  .description('start daemon or child process managed by daemon')
  .action(async id => {
    const spawnInfo = await startInDetachedMode(id);
    logColorful({}, serializeSpawnResponse(spawnInfo));
  });

program
  .command('restart [id]')
  .description('restart child process managed by daemon')
  .action(async id => {
    const result = await restart(id);
    logColorful({}, result);
  });

program
  .command('stop [id]')
  .description('stop daemon or child process managed by daemon')
  .action(async id => {
    const result = await stop(id);
    logColorful({}, result);
  });

program
  .command('log [id]')
  .description('get output logs of child process managed by daemon')
  .action(async id => {
    const result = await log(id);
    const data = (result as any)?.data;
    if (!data) {
      logColorful({}, result);
      return;
    }
    if (data.outFile || data.errorFile) {
      console.log(`Tailing log files: ${data.outFile}, ${data.errorFile}`);
      const tail = spawn('tail', ['-f', data.outFile, data.errorFile], {stdio: 'inherit'});
      tail.on('exit', code => process.exit(code ?? 0));
    } else {
      logColorful({}, result);
    }
  });

program.parse(process.argv);
