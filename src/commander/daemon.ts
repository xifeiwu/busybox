import {Command} from 'commander';
import {ping, info, start, stop} from '../daemon';
import {logColorful} from '../service/external';

const program = new Command();
program.name('daemon').description('daemon child process');

program
  .command('ping')
  .description('')
  .action(async () => {
    const result = await ping();
    logColorful({}, result);
  });
program
  .command('info [id]')
  .description('')
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
  .command('stop [id]')
  .description('stop daemon or child process managed by daemon')
  .action(async id => {
    const result = await stop(id);
    logColorful({}, result);
  });

program.parse(process.argv);
