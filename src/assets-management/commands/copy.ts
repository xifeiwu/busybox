import {copyAsset} from '../external';
import {createRegistry, resolveMetaHandlers, type AssetsCommandOptions} from './shared';

export interface AssetsCopyMoveOptions extends AssetsCommandOptions {
  overwrite?: boolean;
}

export async function runAssetsCopyCommand(
  assetsDir: string,
  source: string,
  target: string,
  options?: AssetsCopyMoveOptions
) {
  const registry = createRegistry(assetsDir);
  const metaHandlers = await resolveMetaHandlers(registry, options);
  await copyAsset(metaHandlers, [{sourcePath: source, targetPath: target}], {
    overwrite: options?.overwrite ?? options?.runDirectly,
  });
}
