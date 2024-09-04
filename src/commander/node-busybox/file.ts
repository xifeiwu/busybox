import {Command} from 'commander';
import path from 'path';
import {flatChildren, getFileInfoTree, getLineCountMap, logColorful} from '@modules/lib/node';
import {intWord} from '@modules/lib/fe';

export function appendFileCommand(program: Command) {
  program
    .command('line-count <filePath>')
    .description('show line count of a file or a directory')
    .action(async filePath => {
      const lineCountMap = getLineCountMap(filePath);
      const lineCountList = flatChildren(lineCountMap, {
        includeDir: true,
        sortChildren: (prev, next) => {
          return next.lineCount - prev.lineCount;
        },
      });
      const finalStr = lineCountList
        .map(({relativePath, lineCount, children}) => {
          return `${relativePath}${Array.isArray(children) ? '/' : ''}: ${lineCount}`;
        })
        .join('\n');
      logColorful({color: 'black'}, finalStr);
    });

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
        .map(({relativePath, stat, children}) => {
          return `${relativePath}${Array.isArray(children) ? '/' : ''}: ${intWord(stat.size)}`;
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
      const reg = new RegExp(key);
      var {dir, maxDepth} = options;
      dir = path.resolve(dir);
      console.log(`searching dir: ${dir}`);
      console.log('');
      // const fileList = getFileList(dir);
      const fileInfoTree = getFileInfoTree(dir, {
        fileFilter({relativePath}) {
          return reg.test(relativePath);
        },
      });
      const filePathList = flatChildren(fileInfoTree, {includeDir: true}).map(it => it.relativePath);
      if (filePathList.length === 0) {
        console.log('not found');
      } else {
        console.log(`${filePathList.length} files found:`);
        filePathList.forEach(it => console.log(it));
      }
    });
}
