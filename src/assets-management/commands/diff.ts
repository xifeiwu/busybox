import {diffMetaForSyncUp, getAssetPartialInfoTreeMeta, printDiffSummary} from '../external';
import {createMetaSourceRegistry, resolveMetaHandlers, type AssetsMetaCliOptions} from '../meta-source';

export async function runAssetsDiffCommand(assetsDir: string, options?: AssetsMetaCliOptions) {
  const registry = createMetaSourceRegistry(assetsDir);
  const metaHandlers = await resolveMetaHandlers(registry, options);
  const currentMeta = await metaHandlers.getMeta();
  const partialMetaFromAssets = await getAssetPartialInfoTreeMeta(registry.assetsDir);
  const diff = await diffMetaForSyncUp(currentMeta, partialMetaFromAssets);
  printDiffSummary(diff);
}
