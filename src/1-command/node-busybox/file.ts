import {Command} from 'commander';
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
    .option('-e, --exclude <exclude...>', 'exclude by relativePath')
    .option('-l, --level <level>', 'exclude by relativePath')
    .option('-f, --folder-only', 'kill processes filtered out')
    .description('show line count of a file or a directory')
    .action(
      async (
        filePath,
        options: {
          exclude?: string[];
          level?: string;
          folderOnly?: boolean;
        }
      ) => {
        const {exclude, folderOnly} = options;
        let maxLevel: number;
        if (options.level !== undefined) {
          maxLevel = parseInt(options.level);
          if (!Number.isInteger(maxLevel)) {
            throw new Error(`param -l must be a number`);
          }
        }
        function getFilter() {
          const filterOutList: string[] = [];
          let filter: FileFilter = () => true;
          if (Array.isArray(exclude) && exclude.length > 0) {
            const regList = exclude.map(it => new RegExp(it));
            filter = ({relativePath}) => {
              const noMatch = !regList.some(it => it.test(relativePath));
              if (!noMatch) {
                filterOutList.push(relativePath);
              }
              return noMatch;
            };
          }
          return {fileFilter: filter, dirFilter: filter, filterOutList};
        }
        const {fileFilter, dirFilter, filterOutList} = getFilter();
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
          logColorful({color: 'red'}, `filter out file list:`);
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
