import {runInitMeta} from './init';

export async function testInit() {
  const rootDir =
    '/Users/xfwu/code/node/tool/busybox/modules/lib/node/lib/assets-management/test/.tmp/source';
  await runInitMeta({rootDir: rootDir});
}
