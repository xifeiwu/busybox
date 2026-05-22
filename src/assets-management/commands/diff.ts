import {
  alignMetaWithAssets,
  diffMetaForSyncUp,
  getAssetPartialInfoTreeMeta,
  printDiffSummary,
} from '../external';
import {getDefaultMetaHandler, type AssetsMetaCliOptions} from '../service';

export async function runAssetsDiffCommand(assetsDir: string, options?: AssetsMetaCliOptions) {
  const {meta} = options ?? {};
  const metaHandler = await getDefaultMetaHandler(assetsDir, meta);

  await alignMetaWithAssets(metaHandler);
  const currentMeta = await metaHandler.getMeta();
  const partialMetaFromAssets = await getAssetPartialInfoTreeMeta(assetsDir);
  const diff = await diffMetaForSyncUp(currentMeta, partialMetaFromAssets);
  printDiffSummary(diff);
}
