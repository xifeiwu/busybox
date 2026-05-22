import {copyAsset} from '../external';
import {
  createMetaSourceRegistry,
  resolveMetaHandlers,
  type AssetsMetaRunDirectlyCliOptions,
} from '../meta-source';

export interface AssetsCopyMoveOptions extends AssetsMetaRunDirectlyCliOptions {
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
