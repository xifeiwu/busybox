import {Command} from 'commander';
import {logColorful} from '../../modules/lib/node/log';
import {
  runAssetsAddCommand,
  runAssetsCopyCommand,
  runAssetsDiffCommand,
  runAssetsMetaSyncupCommand,
  runAssetsMoveCommand,
  runAssetsPullCommand,
  runAssetsPushCommand,
} from './commands';

const program = new Command();
program.name('assets').description('Manage assets directory metadata and sync');

function wrapAction(handler: (...args: unknown[]) => Promise<void>) {
  return async (...args: unknown[]) => {
    try {
      await handler(...args);
    } catch (err) {
      logColorful({color: 'red'}, err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    }
  };
}

program
  .command('diff')
  .description('Show diff between persisted meta and files on disk')
  .argument('<dir>', 'assets root directory')
  .option('--meta <key>', 'meta source key (from .meta/{local|sqlite|mysql}_*.{js,ts})')
  .action(wrapAction((dir: string, opts) => runAssetsDiffCommand(dir, opts)));

program
  .command('add')
  .description('Add file(s) to assets dir, or align meta with disk when file is omitted')
  .argument('<dir>', 'assets root directory')
  .argument('[file]', 'source file or folder to add')
  .option('--meta <key>', 'meta source key (from .meta/{local|sqlite|mysql}_*.{js,ts})')
  .option('--to <path>', 'target relative path in assets dir')
  .option('--overwrite', 'overwrite existing files without prompting')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(wrapAction((dir: string, file: string | undefined, opts) => runAssetsAddCommand(dir, file, opts)));

program
  .command('copy')
  .description('Copy files or folders within assets dir')
  .argument('<dir>', 'assets root directory')
  .argument('<source>', 'source relative path')
  .argument('<target>', 'target relative path')
  .option('--meta <key>', 'meta source key (from .meta/{local|sqlite|mysql}_*.{js,ts})')
  .option('--overwrite', 'overwrite existing files without prompting')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(
    wrapAction((dir: string, source: string, target: string, opts) =>
      runAssetsCopyCommand(dir, source, target, opts)
    )
  );

program
  .command('move')
  .description('Move files or folders within assets dir')
  .argument('<dir>', 'assets root directory')
  .argument('<source>', 'source relative path')
  .argument('<target>', 'target relative path')
  .option('--meta <key>', 'meta source key (from .meta/{local|sqlite|mysql}_*.{js,ts})')
  .option('--overwrite', 'overwrite existing files without prompting')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(
    wrapAction((dir: string, source: string, target: string, opts) =>
      runAssetsMoveCommand(dir, source, target, opts)
    )
  );

program
  .command('meta-syncup')
  .description('Sync meta between two meta sources (requires multiple sources)')
  .argument('<dir>', 'assets root directory')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(wrapAction((dir: string, opts) => runAssetsMetaSyncupCommand(dir, opts)));

program
  .command('push')
  .description('Align local meta, then push assets to a local dir or remote server')
  .argument('<dir>', 'local assets root directory')
  .argument('[target]', 'local directory or remote host[:port]')
  .option('-H, --host <host>', 'remote server host (when target is omitted)', '127.0.0.1')
  .option('-p, --port <port>', 'remote server port', '80')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(
    wrapAction((dir: string, target: string | undefined, opts) => runAssetsPushCommand(dir, target, opts))
  );

program
  .command('pull')
  .description('Align local meta, then pull assets from a local dir or remote server')
  .argument('<dir>', 'local assets root directory')
  .argument('[target]', 'local directory or remote host[:port]')
  .option('-H, --host <host>', 'remote server host (when target is omitted)', '127.0.0.1')
  .option('-p, --port <port>', 'remote server port', '80')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(
    wrapAction((dir: string, target: string | undefined, opts) => runAssetsPullCommand(dir, target, opts))
  );

program.parse(process.argv);
