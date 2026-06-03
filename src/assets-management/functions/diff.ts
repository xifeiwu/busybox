import {
  updateMetaHandlerMeta,
  diffMetaForSyncUp,
  getAssetPartialInfoTreeMeta,
  printDiffForSyncUp,
  applyDiffForMetaSyncup,
  goOnOrNot,
} from '../external';
import {getDefaultMetaHandler, type AssetsMetaCliOptions} from '../service';

export async function runAssetsDiffCommand(assetsDir: string, options?: AssetsMetaCliOptions) {
  const {meta} = options ?? {};
  const metaHandler = await getDefaultMetaHandler(assetsDir, meta);

  const currentMeta = await metaHandler.getMeta();
  const partialMetaFromAssets = await getAssetPartialInfoTreeMeta(assetsDir);
  const diff = await diffMetaForSyncUp(currentMeta, partialMetaFromAssets);
  printDiffForSyncUp(diff);
  if (!diff.isNeedAction) {
    return;
  }
  if (
    await goOnOrNot({
      tips: [`Apply the diff to meta of dir "${assetsDir}"?`],
      style: {color: 'yellow'},
      defaultValue: true,
    })
  ) {
    await applyDiffForMetaSyncup(metaHandler, diff, {runDirectly: true});
  }
}
