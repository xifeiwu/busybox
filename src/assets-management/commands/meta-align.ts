import {alignTwoMetas, diffMetaForSyncUp, goOnOrNot, printDiffForSyncUp} from '../external';
import {
  getMetaSourceList,
  getPrimaryMetaHandler,
  getPrimaryMetaSourceKey,
  selectMetaHandler,
} from '../service';
import {type AssetsRunDirectlyCliOptions} from '../service';

/**
 * align two metas of the same dir
 */
export async function runAssetsMetaAlignCommand(assetsDir: string, options?: AssetsRunDirectlyCliOptions) {
  const primaryMetaHandler = await getPrimaryMetaHandler(assetsDir);
  if (getMetaSourceList(assetsDir).length < 2) {
    throw new Error(
      'meta-syncup requires at least two meta sources (files matching .meta/{local|sqlite|mysql}_*.{js,ts})'
    );
  }

  const targetMetaHandler = await selectMetaHandler(assetsDir, {
    selectTips: ['Select target meta (to)'],
    excludeKeys: [getPrimaryMetaSourceKey(assetsDir)],
  });

  const fromMeta = await primaryMetaHandler.getMeta();
  const toMeta = await targetMetaHandler.getMeta();
  const diff = await diffMetaForSyncUp(toMeta, fromMeta);
  printDiffForSyncUp(diff);

  if (!diff.isNeedAction) {
    return;
  }

  if (
    !options?.runDirectly &&
    !(await goOnOrNot({
      tips: [`Apply meta sync from "${primaryMetaHandler.rootDir}" to "${targetMetaHandler.rootDir}"?`],
      defaultValue: true,
    }))
  ) {
    return;
  }

  await alignTwoMetas(targetMetaHandler, fromMeta, {runDirectly: true});
}
