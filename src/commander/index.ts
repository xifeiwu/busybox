import fs from 'fs';
import path from 'path';
import {createHash} from 'crypto';
import {Command} from 'commander';
import {getLineCount, logWithColor, toConsole} from '@modules/lib/node';

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
    const result = getLineCount(filePath);
    if (Array.isArray(result)) {
      logWithColor(
        'black',
        result
          .sort(({lineCount: v1}, {lineCount: v2}) => v2 - v1)
          .reduce<object>((sum, it) => {
            const {relativePath, lineCount} = it;
            sum[relativePath] = lineCount;
            return sum;
          }, {})
      );
    } else {
      toConsole(result);
    }
  });

program.parse(process.argv);
