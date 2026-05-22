import {alignMetaWithAssets, copyAsset} from '../external';
import {
  getMetaHandlersByKey,
  getPrimaryMetaHandlers,
  selectMetaHandler,
  type AssetsMetaRunDirectlyCliOptions,
} from '../service';

export interface AssetsCopyMoveOptions extends AssetsMetaRunDirectlyCliOptions {
  overwrite?: boolean;
}

export async function runAssetsCopyCommand(
  assetsDir: string,
  source: string,
  target: string,
  options?: AssetsCopyMoveOptions
) {
  const {meta} = options ?? {};
  const metaHandlers = meta
    ? await getMetaHandlersByKey(assetsDir, meta)
    : await getPrimaryMetaHandlers(assetsDir);

  await alignMetaWithAssets(metaHandlers);
  await copyAsset(metaHandlers, [{sourcePath: source, targetPath: target}], {
    overwrite: options?.overwrite ?? options?.runDirectly,
  });
}
