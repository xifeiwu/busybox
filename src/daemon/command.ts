import {Command} from 'commander';
import {info, start, restart, stop} from './service';
import {logColorful} from '../service/external';

const program = new Command();
program.name('daemon').description('daemon child process');

program
  .command('info [id]')
  .description('get info of child process by id, or list all')
  .action(async id => {
    const result = await info(id);
    logColorful({}, result);
  });
program
  .command('start [id]')
  .description('start child process in detached mode')
  .action(async id => {
    await start(id);
  });

program
  .command('restart [id]')
  .description('restart child process')
  .action(async id => {
    await restart(id);
  });

program
  .command('stop [id]')
  .description('stop child process')
  .action(async id => {
    await stop(id);
  });

program.parse(process.argv);
