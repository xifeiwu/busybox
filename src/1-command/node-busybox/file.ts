import {Command, Option} from 'commander';
import path from 'path';
import {
  intToWord,
  getFileInfoTree,
  logColorful,
  flatChildren,
  getLineCountMap,
  FileFilter,
} from '../../service/external';
import {searchFileInDir} from '../../../modules/lib/node/fs/go-through-dir';

export function appendFileCommand(program: Command) {
  program
    .command('line-count <filePath>')
    .option(
      '-i, --include <include...>',
      'substring pattern(s); when set, only matching relative paths are kept; include overrides --exclude (metacharacters escaped). Use --filter-scope to limit to files or dirs only.'
    )
    .option(
      '-e, --exclude <exclude...>',
      'substring pattern(s); omit matching relative paths (ignored when --include matches; metacharacters escaped). Scope with --filter-scope.'
    )
    .addOption(
      new Option(
        '--filter-scope <scope>',
        'whether --include/--exclude apply to leaf files, directory paths (prune when a dir fails), or both'
      )
        .choices(['both', 'file', 'dir'] as const)
        .default('file')
    )
    .option('-l, --level <level>', 'maximum tree depth to print (integer, root depth is 0)')
    .option('-f, --folder-only', 'only print directories, skip leaf files in the listing')
    .description('show line count of a file or a directory')
    .action(
      async (
        filePath,
        options: {
          include?: string[];
          exclude?: string[];
          filterScope?: 'both' | 'file' | 'dir';
          level?: string;
          folderOnly?: boolean;
        }
      ) => {
        const {include, exclude, folderOnly, filterScope = 'file'} = options;
        let maxLevel: number;
        if (options.level !== undefined) {
          maxLevel = parseInt(options.level);
          if (!Number.isInteger(maxLevel)) {
            throw new Error(`param -l must be a number`);
          }
        }
        function getFilter(scope: 'both' | 'file' | 'dir') {
          const filterOutList: string[] = [];
          const includeRegs =
            Array.isArray(include) && include.length > 0 ? include.map(it => new RegExp(it)) : [];
          const excludeRegs =
            Array.isArray(exclude) && exclude.length > 0 ? exclude.map(it => new RegExp(it)) : [];
          const pathFilter: FileFilter =
            includeRegs.length > 0 || excludeRegs.length > 0
              ? ({relativePath}) => {
                  const hasInclude = includeRegs.length > 0;
                  const incMatch = hasInclude && includeRegs.some(it => it.test(relativePath));
                  const excMatch = excludeRegs.length > 0 && excludeRegs.some(it => it.test(relativePath));
                  const keep = (!hasInclude || incMatch) && (!excMatch || incMatch);
                  if (!keep) {
                    filterOutList.push(relativePath);
                  }
                  return keep;
                }
              : () => true;
          const fileFilter: FileFilter = scope === 'dir' ? () => true : pathFilter;
          const dirFilter: FileFilter = scope === 'file' ? () => true : pathFilter;
          return {fileFilter, dirFilter, filterOutList};
        }
        const {fileFilter, dirFilter, filterOutList} = getFilter(filterScope);
        const lineCountMap = getLineCountMap(filePath, {
          fileFilter,
          dirFilter,
        });
        const lineCountList = flatChildren(lineCountMap, {
          includeDir: true,
          sortChildren: (prev, next) => {
            return next.lineCount - prev.lineCount;
          },
        });
        const finalStr = lineCountList
          .filter(it => {
            const levelCheck = !Number.isInteger(maxLevel) || it.depth <= maxLevel;
            const folderCheck = !folderOnly || Array.isArray(it.children);
            return levelCheck && folderCheck;
          })
          .map(({relativePath, lineCount, depth, children}) => {
            return `${relativePath}${Array.isArray(children) ? '/' : ''}: ${lineCount}`;
          })
          .join('\n');
        logColorful({color: 'black'}, finalStr);
        if (filterOutList.length > 0) {
          logColorful({color: 'red'}, `paths omitted by --include / --exclude:`);
          for (const relativePath of filterOutList) {
            logColorful({color: 'black'}, relativePath);
          }
        }
      }
    );

  program
    .command('size <dir>')
    .description('show size of file(dir)')
    .option('-m, --max-depth <maxDepth>', 'max dir depth', null)
    .action(async (dir, options) => {
      const fileSizeTree = getFileInfoTree(dir);
      const fileSizeList = flatChildren(fileSizeTree, {
        sortChildren(pre, next) {
          return next.size - pre.size;
        },
      });
      const finalStr = fileSizeList
        .map(({relativePath, stats, children}) => {
          return `${relativePath}${Array.isArray(children) ? '/' : ''}: ${intToWord(stats.size)}`;
        })
        .join('\n');
      logColorful({color: 'black'}, finalStr);
    });

  program
    .command('find <key>')
    .description('find file by key')
    .option('-d, --dir <directory>', 'data to post', '.')
    .option('-m, --max-depth <maxDepth>', 'max dir depth', null)
    .action(async (key, options) => {
      // const reg = new RegExp(key);
      var {dir, maxDepth} = options;
      dir = path.resolve(dir);
      logColorful(
        {},
        {
          searchDir: dir,
          filter: key,
        }
      );
      logColorful({}, '...in searching');
      const results = searchFileInDir(dir, {filter: key, maxDepth});
      logColorful({}, 'search results:', results);
    });
}
