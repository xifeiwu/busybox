import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {hashData, logColorful, isObject} from '../../service/external';

export function appendOtherCommand(program: Command) {
  program
    .command('hash <fileOrContent>')
    .option('-a, --algorithm <algorithm>', `algorithm['md5' | 'sha1' | 'sha256']`, 'sha1')
    .option('-e, --encode <encode>', `encode['base64' | 'base64url' | 'hex' | 'binary']`, 'hex')
    .action(async (fileOrContent, options) => {
      const {algorithm, encode} = options;
      const filePath = path.resolve(process.cwd(), fileOrContent);
      let type: 'file' | 'string' = 'string';
      let digest: string;
      /** if file exists, read file, else treat as content*/
      if (fs.existsSync(filePath)) {
        type = 'file';
        digest = await hashData(fs.createReadStream(filePath), {algorithm, encode});
      } else {
        type = 'string';
        digest = await hashData(fileOrContent, {algorithm, encode});
      }
      logColorful({color: 'black'}, `${type} ${algorithm} ${encode} digest:`, digest);
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
    .option('-b, --cookie <cookie>', 'header')
    .option('-d, --data --data-raw <data>', 'data')
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
        parts.push(`'${isObject(value) ? JSON.stringify(value, null, 2) : value}'`);
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
