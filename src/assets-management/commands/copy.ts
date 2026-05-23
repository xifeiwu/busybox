import {alignMetaWithAssets, copyAsset, printOperatedAssets} from '../external';
import {getDefaultMetaHandler, type AssetsMetaRunDirectlyCliOptions} from '../service';

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

  const metaHandler = await getDefaultMetaHandler(assetsDir, meta);

  await alignMetaWithAssets(metaHandler);
  const results = await copyAsset(metaHandler, [{sourcePath: source, targetPath: target}], {
    overwrite: options?.overwrite ?? options?.runDirectly,
  });
  printOperatedAssets(results);
}
