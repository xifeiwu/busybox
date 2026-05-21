import path from 'path';
import {DEFAULT_BIN_DIR} from './service';
import {logColorful, linkFile} from '../service/external';

export async function testToGlobalBinByLink() {
  const binFile = path.join(process.env.HOME, `code/node/webpack/react-tsx-less/src/command/bin.ts`);
  const targetFile = path.join(DEFAULT_BIN_DIR, 'react-tsx-less');
  linkFile(binFile, targetFile);
  logColorful({color: 'green'}, `Created Link: ${linkFile} -> ${binFile}`);
}
