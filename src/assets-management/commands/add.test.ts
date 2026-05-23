import path from 'path';
import {runAssetsAddCommand} from './add';

export async function testRunAssetsAddCommand() {
  const assetsDir =
    '/Users/xfwu/code/node/tool/busybox/modules/lib/node/lib/assets-management/test/.tmp/target';
  await runAssetsAddCommand(assetsDir, __filename, undefined, {runDirectly: true});
  //   const metaHandlers = await getFileMetaHandler()(SOURCE_DIR);
  //   await metaHandlers.getMeta();
  //   await alignMetaWithAssets(metaHandlers);
  //   const bkMetaHandlers = await getFileMetaHandler()(TARGET_DIR);
  //   await bkMetaHandlers.getMeta();
  //   await alignMetaWithAssets(bkMetaHandlers);
  //   await handleAssetsBackup(bkMetaHandlers, metaHandlers);
}
