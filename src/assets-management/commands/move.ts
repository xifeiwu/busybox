import {moveAsset} from '../external';
import {createRegistry, resolveMetaHandlers, type AssetsCommandOptions} from './shared';
import type {AssetsCopyMoveOptions} from './copy';

export async function runAssetsMoveCommand(
  assetsDir: string,
  source: string,
  target: string,
  options?: AssetsCopyMoveOptions
) {
  const registry = createRegistry(assetsDir);
  const metaHandlers = await resolveMetaHandlers(registry, options);
  await moveAsset(metaHandlers, [{sourcePath: source, targetPath: target}], {
    overwrite: options?.overwrite ?? options?.runDirectly,
  });
}
