import {compile} from './0-compile';
import {generateBinFile, linkBin} from './1-link-bin';
import {DEFAULT_BIN_DIR} from './service';

const projectMode = 'ts';
export async function testAll() {
  await compile();
  await generateBinFile({projectMode});
  await linkBin(DEFAULT_BIN_DIR, {projectMode});
}
