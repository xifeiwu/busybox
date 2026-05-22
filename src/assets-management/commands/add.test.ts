import path from 'path';
import {runAssetsAddCommand} from './add';

export async function testRunAssetsAddCommand() {
  const targetDir = path.join(__dirname, '../../../modules/lib/node/lib/assets-management/test/.tmp/source');
  await runAssetsAddCommand(targetDir, __filename, {runDirectly: true});
  //   const metaHandlers = await getFileMetaHandler()(SOURCE_DIR);
  //   await metaHandlers.getMeta();
  //   await alignMetaWithAssets(metaHandlers);
  //   const bkMetaHandlers = await getFileMetaHandler()(TARGET_DIR);
  //   await bkMetaHandlers.getMeta();
  //   await alignMetaWithAssets(bkMetaHandlers);
  //   await handleAssetsBackup(bkMetaHandlers, metaHandlers);
}
