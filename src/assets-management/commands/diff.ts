import {
  alignMetaWithAssets,
  diffMetaForSyncUp,
  getAssetPartialInfoTreeMeta,
  printDiffSummary,
} from '../external';
import {getMetaHandlersByKey, getPrimaryMetaHandlers, type AssetsMetaCliOptions} from '../service';

export async function runAssetsDiffCommand(assetsDir: string, options?: AssetsMetaCliOptions) {
  const {meta} = options ?? {};
  const metaHandlers = meta
    ? await getMetaHandlersByKey(assetsDir, meta)
    : await getPrimaryMetaHandlers(assetsDir);

  await alignMetaWithAssets(metaHandlers);
  const currentMeta = await metaHandlers.getMeta();
  const partialMetaFromAssets = await getAssetPartialInfoTreeMeta(assetsDir);
  const diff = await diffMetaForSyncUp(currentMeta, partialMetaFromAssets);
  printDiffSummary(diff);
}
