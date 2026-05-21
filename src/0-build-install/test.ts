import {build} from './0-build';
import {linkBin} from './1-link-bin';
import {DEFAULT_BIN_DIR} from './service';

const projectMode = 'ts';
export async function testAll() {
  await build();
  await linkBin(DEFAULT_BIN_DIR, {projectMode});
}
