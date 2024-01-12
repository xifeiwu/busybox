import fs from 'fs';
import path from 'path';
import {createHash} from 'crypto';
import {Command} from 'commander';
import {
  filesize,
  flatChildren,
  getFileInfoTree,
  getFileList,
  getFileSizeList,
  getLineCountMap,
  logWithColor,
  toConsole,
} from '@modules/lib/node';

const program = new Command();
program
  .name('nb')
  .description('busybox on node')
  .command('process', 'handle process', {executableFile: 'process.ts'});

program.command('md5 <fileOrContent>').action(async fileOrContent => {
  let data = fileOrContent;
  const filePath = path.resolve(process.cwd(), fileOrContent);
  if (fs.existsSync(filePath)) {
    data = fs.readFileSync(filePath);
  }
  console.log(createHash('md5').update(data).digest('hex'));
});

program.command('base64 <fileOrContent>').action(async fileOrContent => {
  let data = fileOrContent;
  const filePath = path.resolve(process.cwd(), fileOrContent);
  if (fs.existsSync(filePath)) {
    data = fs.readFileSync(filePath);
  }
  console.log(Buffer.from(data).toString('base64'));
});

program
  .command('line-count <filePath>')
  .description('show line count of a file or a directory')
  .action(async filePath => {
    const lineCountMap = getLineCountMap(filePath);
    const lineCountList = flatChildren(lineCountMap, {ignoreParent: true});
    const finalStr = lineCountList
      .sort((prev, next) => {
        return next.lineCount - prev.lineCount;
      })
      .map(({relativePath, lineCount}) => {
        return relativePath + ': ' + lineCount;
      })
      .join('\n');
    logWithColor('black', finalStr);
  });

program
  .command('size <dir>')
  .description('show size of file(dir)')
  .option('-m, --max-depth <maxDepth>', 'max dir depth', null)
  .action(async (dir, command) => {
    const fileInfoTree = getFileInfoTree(dir);
    const fileInfoList = flatChildren(fileInfoTree, {ignoreParent: true});
    const finalStr = fileInfoList
      .map(it => {
        const {stat, relativePath} = it;
        return {relativePath, size: stat.size};
      })
      .sort((prev, next) => {
        return next.size - prev.size;
      })
      .map(({relativePath, size}) => {
        return relativePath + ': ' + filesize(size);
      })
      .join('\n');
    logWithColor('black', finalStr);
  });

program
  .command('find <key>')
  .description('find file by key')
  .option('-d, --dir <directory>', 'data to post', '.')
  .option('-m, --max-depth <maxDepth>', 'max dir depth', null)
  .action(async (key, command) => {
    const reg = new RegExp(key);
    var {dir, maxDepth} = command;
    dir = path.resolve(dir);
    console.log(`searching dir: ${dir}`);
    console.log('');
    // const fileList = getFileList(dir);
    const fileInfoTree = getFileInfoTree(dir, {
      fileFilter({baseName, relativePath}) {
        return reg.test(relativePath);
      },
    });
    const filePathList = flatChildren(fileInfoTree, {ignoreParent: true}).map(it => it.relativePath);
    if (filePathList.length === 0) {
      console.log('not found');
    } else {
      console.log(`${filePathList.length} files found:`);
      filePathList.forEach(it => console.log(it));
    }
  });

// commander.command('rm <key>')
//   .description('rm file by key')
//   .option('-d, --dir <directory>', 'data to post', '.')
//   .option('-m, --max-depth <maxDepth>', 'max dir depth', null)
//   .action(async (key, command) => {
//     var {dir, maxDepth} = command;
//     dir = path.resolve(dir);
//     console.log(`target dir: ${dir}`);
//     console.log('');
//     const readDirRecursive = require('fs-readdir-recursive/advance')({
//       withDir: true,
//       maxDepth
//     });
//     if (!fs.statSync(dir).isDirectory()) {
//       console.log(`Error: ${dir} is not directory!`);
//       return;
//     }
//     const reg = new RegExp(key);
//     const fileList = readDirRecursive(dir, f => f).filter(it => reg.test(it));
//     if (fileList.length === 0) {
//       console.log('not file found');
//       return;
//     }
//     console.log('files to delete:');
//     fileList.forEach(it => console.log(it));

//     const rl = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout
//     });
//     answer = await new Promise((resolve, reject) => {
//       rl.question('你确定要删除这些文件？(yes/y)', (answer) => {
//         resolve(answer);
//         rl.close();
//       });
//     });
//     if (['yes', 'y'].includes(answer)) {
//       fileList.forEach(it => {
//         try {
//           const theFile = path.resolve(dir, it);
//           fs.statSync(theFile);
//           nodeUtils.deleteFile(theFile);
//           console.log(`deleted: ${theFile}`);
//         } catch (err) {}
//       });
//       console.log(`deleted: ${fileList.length}`);
//     } else {
//       console.log('取消删除');
//     }
//   });

program.parse(process.argv);
