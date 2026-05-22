import {alignTwoMetas, diffMetaForSyncUp, goOnOrNot, printDiffSummary} from '../external';
import {getMetaHandlersForSource, selectMetaSource} from '../meta-source';
import {createMetaSourceRegistry, type AssetsRunDirectlyCliOptions} from '../meta-source';

export async function runAssetsMetaSyncupCommand(assetsDir: string, options?: AssetsRunDirectlyCliOptions) {
  const registry = createMetaSourceRegistry(assetsDir);
  if (registry.entries.length < 2) {
    throw new Error(
      'meta-syncup requires at least two meta sources (files matching .meta/{local|sqlite|mysql}_*.{js,ts})'
    );
  }

  const fromSource = await selectMetaSource(registry, {tips: ['Select source meta (from)']});
  const toSource = await selectMetaSource(registry, {
    tips: ['Select target meta (to)'],
    excludeKeys: [],
  });

  const fromHandlers = await getMetaHandlersForSource(fromSource, registry.assetsDir);
  const toHandlers = await getMetaHandlersForSource(toSource, registry.assetsDir);
  const fromMeta = await fromHandlers.getMeta();
  const toMeta = await toHandlers.getMeta();
  const diff = await diffMetaForSyncUp(toMeta, fromMeta);
  printDiffSummary(diff);

  if (!diff.isNeedAction) {
    return;
  }

  if (
    !options?.runDirectly &&
    !(await goOnOrNot({
      tips: [`Apply meta sync from "${fromSource.key}" to "${toSource.key}"?`],
      defaultValue: true,
    }))
  ) {
    return;
  }

  await alignTwoMetas(toHandlers, fromMeta, {runDirectly: true});
}
