import {Command} from 'commander';
import {logColorful} from '../../modules/lib/node/log';
import {findAssetsRootDir, getMetaSourceList} from './service';
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
import type {
  AssetsEmptyCliOptions,
  AssetsMetaCliOptions,
  AssetsMetaRunDirectlyCliOptions,
  AssetsRunDirectlyCliOptions,
} from './service';

const program = new Command();
program
  .name('assets')
  .description('Manage assets directory metadata and sync')
  .option('-d, --dir <dir>', 'assets root directory (default: search upward for .meta)');

function getGlobalDirOption(): string | undefined {
  return program.opts<{dir?: string}>().dir;
}

function wrapActionWithPositionals<P extends readonly unknown[], O extends Record<string, unknown>>(
  handler: (rootDir: string, ...args: [...P, O]) => Promise<void>
): (...args: unknown[]) => Promise<void> {
  return async (...args: unknown[]) => {
    const opts = args[args.length - 1] as O;
    const positional = args.slice(0, -1) as unknown as P;
    try {
      const rootDir = findAssetsRootDir(getGlobalDirOption());
      logColorful({color: 'yellow'}, `rootDir: ${rootDir}`);
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
      console.log(`init meta info for rootDir success: ${rootDir}`);
    } catch (err) {
      logColorful({color: 'red'}, err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    }
  });

program
  .command('diff')
  .description('Show diff between persisted meta and files on disk')
  .option('--meta <key>', 'meta source key (from .meta/{local|sqlite|mysql}_*.{js,ts})')
  .action(
    wrapActionWithPositionals<[], AssetsMetaCliOptions>((rootDir, opts) =>
      runAssetsDiffCommand(rootDir, opts)
    )
  );

program
  .command('add')
  .description('Add file(s) to assets dir, or align meta with disk when file is omitted')
  .argument('<source>', 'source file or folder to add')
  .argument('[target]', 'target relative path')
  .option('--meta <key>', 'meta source key (from .meta/{local|sqlite|mysql}_*.{js,ts})')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(
    wrapActionWithPositionals<[string, string | undefined], AssetsMetaRunDirectlyCliOptions>(
      (rootDir, source, target, opts) => runAssetsAddCommand(rootDir, source, target, opts)
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
    wrapActionWithPositionals<[string, string], AssetsMetaRunDirectlyCliOptions>(
      (rootDir, source, target, opts) => runAssetsCopyCommand(rootDir, source, target, opts)
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
    wrapActionWithPositionals<[string, string], AssetsMetaRunDirectlyCliOptions>(
      (rootDir, source, target, opts) => runAssetsMoveCommand(rootDir, source, target, opts)
    )
  );

program
  .command('push')
  .description('Align local meta, then push assets to a local dir or remote server')
  .argument('<target>', 'local directory or remote host[:port]')
  .option('--meta <key>', 'meta source key (from .meta/{local|sqlite|mysql}_*.{js,ts})')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(
    wrapActionWithPositionals<[string], AssetsMetaRunDirectlyCliOptions>((rootDir, target, opts) =>
      runAssetsPushCommand(rootDir, target, opts)
    )
  );

program
  .command('pull')
  .description('Align local meta, then pull assets from a local dir or remote server')
  .argument('<target>', 'local directory or remote host[:port]')
  .option('--meta <key>', 'meta source key (from .meta/{local|sqlite|mysql}_*.{js,ts})')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(
    wrapActionWithPositionals<[string], AssetsMetaRunDirectlyCliOptions>((rootDir, target, opts) =>
      runAssetsPullCommand(rootDir, target, opts)
    )
  );

program
  .command('meta-syncup')
  .description('Sync meta between two meta sources (requires multiple sources)')
  .option('-y, --run-directly', 'skip confirmation prompts')
  .action(
    wrapActionWithPositionals<[], AssetsRunDirectlyCliOptions>((rootDir, opts) =>
      runAssetsMetaSyncupCommand(rootDir, opts)
    )
  );
program
  .command('meta-list')
  .description('list all meta sources')
  .action(
    wrapActionWithPositionals<[], AssetsEmptyCliOptions>(async (rootDir, _opts) => {
      const metas = getMetaSourceList(rootDir);
      metas.forEach(meta => {
        logColorful({}, meta.key);
      });
    })
  );

program.parse(process.argv);
