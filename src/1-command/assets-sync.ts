import {Command} from 'commander';
import {runAssetsSyncCommand} from '../../modules/lib/node/lib/assets-management/remote-syncup/client';

const program = new Command();
program.name('assets').description('Sync assets between local and remote server via TCP');

program
  .command('diff')
  .description('Show diff between local and server assets')
  .argument('<dir>', 'local asset directory')
  .option('-H, --host <host>', 'server host', '127.0.0.1')
  .option('-p, --port <port>', 'server port', '80')
  .action((dir, opts) => runAssetsSyncCommand('diff', dir, opts));

program
  .command('push')
  .description('Push local assets to server')
  .argument('<dir>', 'local asset directory')
  .option('-H, --host <host>', 'server host', '127.0.0.1')
  .option('-p, --port <port>', 'server port', '80')
  .action((dir, opts) => runAssetsSyncCommand('push', dir, opts));

program
  .command('pull')
  .description('Pull assets from server to local')
  .argument('<dir>', 'local asset directory')
  .option('-H, --host <host>', 'server host', '127.0.0.1')
  .option('-p, --port <port>', 'server port', '80')
  .action((dir, opts) => runAssetsSyncCommand('pull', dir, opts));

program.parse(process.argv);
