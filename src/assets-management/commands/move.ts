import {alignMetaWithAssets, moveAsset} from '../external';
import {selectMetaHandler} from '../service';
import type {AssetsCopyMoveOptions} from './copy';

export async function runAssetsMoveCommand(
  assetsDir: string,
  source: string,
  target: string,
  options?: AssetsCopyMoveOptions
) {
  // const registry = createMetaSourceRegistry(assetsDir);
  // const metaHandlers = await resolveMetaHandlers(registry, options);
  const {meta} = options ?? {};
  const metaHandlers = await selectMetaHandler(assetsDir, {
    meta,
  });
  await alignMetaWithAssets(metaHandlers);
  await moveAsset(metaHandlers, [{sourcePath: source, targetPath: target}], {
    overwrite: options?.overwrite ?? options?.runDirectly,
  });
}
