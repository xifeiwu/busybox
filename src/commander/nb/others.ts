import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {hashStream, logColorful, isPlainObject} from '@src/service/external';

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

  /** Just used for parse curl command for pretty-curl command */
  program
    .command('curl <url>')
    .option('-X <method>', `http method`)
    .option('-H, --header <header...>', 'header')
    .option('-d, --data <data>', 'data')
    .action((url, options) => {
      // logColorful({color: 'red'}, curlCommand);
      // logColorful({color: 'red'}, options);
      const oneOption = (key: string, value: string) => {
        const parts: string[] = [];
        parts.push((key.length === 1 ? '-' : '--') + key);
        const res = /' *(.*) *'/.exec(value);
        if (res) {
          value = res[1];
        }
        if (key === 'data') {
          /** As for content-type of application/json, the data is string, so try to parse to JSON for pretty console */
          try {
            value = JSON.parse(value);
          } catch {
            /** Ignore */
          }
        }
        parts.push(`'${isPlainObject(value) ? JSON.stringify(value, null, 2) : value}'`);
        return parts.join(' ');
      };
      const lines: string[] = [`curl ${url}`];
      for (const [key, value] of Object.entries(options)) {
        if (Array.isArray(value)) {
          lines.push(...value.map(it => oneOption(key, it)));
        } else {
          lines.push(oneOption(key, value as string));
        }
      }
      logColorful({color: 'black'}, lines.join(' \\\n'));
    });
  program.command('pretty-curl <curlCommand>').action((curlCommand, options) => {
    throw new Error(`should be catched at entrance file`);
  });
}
