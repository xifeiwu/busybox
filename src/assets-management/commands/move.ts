import {alignMetaWithAssets, moveAsset} from '../external';
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
  await moveAsset(metaHandler, [{sourcePath: source, targetPath: target}], {
    overwrite: options?.overwrite ?? options?.runDirectly,
  });
}
