import {
  updateMetaHandlerMeta,
  diffMetaForSyncUp,
  getAssetPartialInfoTreeMeta,
  printDiffForSyncUp,
} from '../external';
import {getDefaultMetaHandler, type AssetsMetaCliOptions} from '../service';

export async function runAssetsDiffCommand(assetsDir: string, options?: AssetsMetaCliOptions) {
  const {meta} = options ?? {};
  const metaHandler = await getDefaultMetaHandler(assetsDir, meta);

  await updateMetaHandlerMeta(metaHandler);
  const currentMeta = await metaHandler.getMeta();
  const partialMetaFromAssets = await getAssetPartialInfoTreeMeta(assetsDir);
  const diff = await diffMetaForSyncUp(currentMeta, partialMetaFromAssets);
  printDiffForSyncUp(diff);
}
