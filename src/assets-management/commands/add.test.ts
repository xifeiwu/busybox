import path from 'path';
import {runAssetsAddCommand} from './add';

export async function testRunAssetsAddCommand() {
  const assetsDir =
    '/Users/xfwu/code/node/tool/busybox/modules/lib/node/lib/assets-management/test/.tmp/target';
  // await runAssetsAddCommand(assetsDir, __filename, undefined, {runDirectly: true});
  await runAssetsAddCommand(assetsDir, assetsDir, undefined, {runDirectly: true});
}
