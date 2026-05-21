import path from 'path';
import {addAsset, alignMetaWithAssets, resolvePathInRoot} from '../external';
import {createRegistry, resolveMetaHandlers, type AssetsCommandOptions} from './shared';

export interface AssetsAddOptions extends AssetsCommandOptions {
  to?: string;
  overwrite?: boolean;
}

export async function runAssetsAddCommand(
  assetsDir: string,
  file: string | undefined,
  options?: AssetsAddOptions
) {
  const registry = createRegistry(assetsDir);
  const metaHandlers = await resolveMetaHandlers(registry, {
    ...options,
    allowSelect: true,
    selectTips: ['Select target meta source for add'],
  });

  if (!file) {
    await alignMetaWithAssets(metaHandlers);
    return;
  }

  const {rootDir} = metaHandlers;
  const {fullpath, relativePath} = resolvePathInRoot(rootDir, file);
  const targetPath =
    options?.to ?? relativePath ?? (path.relative(rootDir, fullpath) || path.basename(fullpath));

  await addAsset(metaHandlers, [{sourcePath: file, targetPath}], {
    overwrite: options?.overwrite ?? options?.runDirectly,
  });
}
