import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {hashStream} from '@modules/lib/node';

export function appendOtherCommand(program: Command) {
  program.command('md5 <relativePath>').action(async relativePath => {
    // let data = relativePath;
    const filePath = path.resolve(process.cwd(), relativePath);
    const md5 = await hashStream(fs.createReadStream(filePath), {
      algorithm: 'md5',
      encode: 'hex',
    });
    console.log(md5);
  });

  program
    .command('sha1 <fileOrContent>')
    .option('-e, --encode <ENCODE>', `encode['base64' | 'base64url' | 'hex' | 'binary']`, 'hex')
    .action(async (fileOrContent, options) => {
      const {encode} = options;
      if (!['base64', 'base64url', 'hex', 'binary'].includes(encode)) {
        throw new Error(`encode should in ['base64', 'base64url', 'hex', 'binary']`);
      }
      const filePath = path.resolve(process.cwd(), fileOrContent);
      const sha1 = await hashStream(fs.createReadStream(filePath), {algorithm: 'sha1', encode});
      console.log(sha1);
    });

  program.command('base64 <fileOrContent>').action(async fileOrContent => {
    let data = fileOrContent;
    const filePath = path.resolve(process.cwd(), fileOrContent);
    if (fs.existsSync(filePath)) {
      data = fs.readFileSync(filePath);
    }
    console.log(Buffer.from(data).toString('base64'));
  });
}
