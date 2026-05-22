import {moveAsset} from '../external';
import {createMetaSourceRegistry, resolveMetaHandlers, type AssetsCommandOptions} from '../meta-source';
import type {AssetsCopyMoveOptions} from './copy';

export async function runAssetsMoveCommand(
  assetsDir: string,
  source: string,
  target: string,
  options?: AssetsCopyMoveOptions
) {
  const registry = createMetaSourceRegistry(assetsDir);
  const metaHandlers = await resolveMetaHandlers(registry, options);
  await moveAsset(metaHandlers, [{sourcePath: source, targetPath: target}], {
    overwrite: options?.overwrite ?? options?.runDirectly,
  });
}
