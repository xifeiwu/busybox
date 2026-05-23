import {alignMetaWithAssets, moveAsset, printOperatedAssets} from '../external';
import {getDefaultMetaHandler} from '../service';
import type {AssetsCopyMoveOptions} from './copy';

export async function runAssetsMoveCommand(
  assetsDir: string,
  source: string,
  target: string,
  options?: AssetsCopyMoveOptions
) {
  const {meta} = options ?? {};
  const metaHandler = await getDefaultMetaHandler(assetsDir, meta);

  await alignMetaWithAssets(metaHandler);
  const results = await moveAsset(metaHandler, [{sourcePath: source, targetPath: target}], {
    overwrite: options?.overwrite ?? options?.runDirectly,
  });
  printOperatedAssets(results);
}
