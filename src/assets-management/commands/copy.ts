import {copyAsset} from '../external';
import {createMetaSourceRegistry, resolveMetaHandlers, type AssetsCommandOptions} from '../meta-source';

export interface AssetsCopyMoveOptions extends AssetsCommandOptions {
  overwrite?: boolean;
}

export async function runAssetsCopyCommand(
  assetsDir: string,
  source: string,
  target: string,
  options?: AssetsCopyMoveOptions
) {
  const registry = createMetaSourceRegistry(assetsDir);
  const metaHandlers = await resolveMetaHandlers(registry, options);
  await copyAsset(metaHandlers, [{sourcePath: source, targetPath: target}], {
    overwrite: options?.overwrite ?? options?.runDirectly,
  });
}
