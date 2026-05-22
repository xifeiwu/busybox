import {Command} from 'commander';
import {logColorful} from '../../modules/lib/node/log';
import {logAssetsRoot, findAssetsRootDir} from './meta-source';
import {
  runAssetsAddCommand,
  runAssetsCopyCommand,
  runAssetsDiffCommand,
  init,
  runAssetsMetaSyncupCommand,
  runAssetsMoveCommand,
  runAssetsPullCommand,
  runAssetsPushCommand,
} from './commands';
import type {AssetsCommandOptions} from './meta-source';

const program = new Command();
program
  .name('assets')
  .description('Manage assets directory metadata and sync')
  .option('-d, --dir <dir>', 'assets root directory (default: search upward for .meta)');

function getGlobalDirOption(): string | undefined {
  return program.opts<{dir?: string}>().dir;
}

function wrapActionWithPositionals(
  handler: (rootDir: string, ...args: [...unknown[], AssetsCommandOptions]) => Promise<void>
): (...args: unknown[]) => Promise<void> {
  return async (...args: unknown[]) => {
    const opts = args[args.length - 1] as AssetsCommandOptions;
    const positional = args.slice(0, -1);
    try {
      const rootDir = findAssetsRootDir(getGlobalDirOption());
      logAssetsRoot(rootDir);
      await handler(rootDir, ...positional, opts);
    } catch (err) {
      logColorful({color: 'red'}, err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    }
  };
}

program
  .command('init')
  .description('Create .meta/ and a local meta source file from assets on disk')
  .action(async (opts: {force?: boolean}) => {
    try {
      const rootDir = await init({dir: getGlobalDirOption()});
      logAssetsRoot(`init meta info for rootDir success: ${rootDir}`);
    } catch (err) {
      logColorful({color: 'red'}, err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    }
  });

program
  .command('diff')
  .description('Show diff between persisted meta and files on disk')
  .option('--meta <key>', 'meta source key (from .meta/{local|sqlite|mysql}_*.{js,ts})')
  .action(wrapActionWithPositionals((rootDir, opts) => runAssetsDiffCommand(rootDir, opts)));

program
  .command('add')
  .description('Add file(s) to assets dir, or align meta with disk when file is omitted')
  .argument('[file]', 'source file or folder to add')
  .option('--meta <key>', 'meta source key (from .meta/{local|sqlite|mysql}_*.{js,ts})')
  .option('--to <path>', 'target relative path in assets dir')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(
    wrapActionWithPositionals((rootDir, file: string | undefined, opts) =>
      runAssetsAddCommand(rootDir, file, opts)
    )
  );

program
  .command('copy')
  .description('Copy files or folders within assets dir')
  .argument('<source>', 'source relative path')
  .argument('<target>', 'target relative path')
  .option('--meta <key>', 'meta source key (from .meta/{local|sqlite|mysql}_*.{js,ts})')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(
    wrapActionWithPositionals((rootDir, source: string, target: string, opts) =>
      runAssetsCopyCommand(rootDir, source, target, opts)
    )
  );

program
  .command('move')
  .description('Move files or folders within assets dir')
  .argument('<source>', 'source relative path')
  .argument('<target>', 'target relative path')
  .option('--meta <key>', 'meta source key (from .meta/{local|sqlite|mysql}_*.{js,ts})')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(
    wrapActionWithPositionals((rootDir, source: string, target: string, opts) =>
      runAssetsMoveCommand(rootDir, source, target, opts)
    )
  );

program
  .command('meta-syncup')
  .description('Sync meta between two meta sources (requires multiple sources)')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(wrapActionWithPositionals((rootDir, opts) => runAssetsMetaSyncupCommand(rootDir, opts)));

program
  .command('push')
  .description('Align local meta, then push assets to a local dir or remote server')
  .argument('[target]', 'local directory or remote host[:port]')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(
    wrapActionWithPositionals((rootDir, target: string | undefined, opts) =>
      runAssetsPushCommand(rootDir, target, opts)
    )
  );

program
  .command('pull')
  .description('Align local meta, then pull assets from a local dir or remote server')
  .argument('<target>', 'local directory or remote host[:port]')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(
    wrapActionWithPositionals((rootDir, target: string | undefined, opts) =>
      runAssetsPullCommand(rootDir, target, opts)
    )
  );

program.parse(process.argv);
