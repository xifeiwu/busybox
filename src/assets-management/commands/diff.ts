import {diffMetaForSyncUp, getAssetPartialInfoTreeMeta, printDiffSummary} from '../external';
import {createRegistry, resolveMetaHandlers, type AssetsCommandOptions} from './shared';

export async function runAssetsDiffCommand(assetsDir: string, options?: AssetsCommandOptions) {
  const registry = createRegistry(assetsDir);
  const metaHandlers = await resolveMetaHandlers(registry, options);
  const currentMeta = await metaHandlers.getMeta();
  const partialMetaFromAssets = await getAssetPartialInfoTreeMeta(registry.assetsDir);
  const diff = await diffMetaForSyncUp(currentMeta, partialMetaFromAssets);
  printDiffSummary(diff);
}
