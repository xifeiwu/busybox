import fs from 'fs';
import path from 'path';
import {addAsset, alignMetaWithAssets, resolvePathInRoot} from '../external';
import {
  createMetaSourceRegistry,
  resolveMetaHandlers,
  type AssetsMetaRunDirectlyCliOptions,
} from '../meta-source';

export async function runAssetsAddCommand(
  assetsDir: string,
  sourceFile: string,
  target?: string,
  options?: AssetsMetaRunDirectlyCliOptions
) {
  sourceFile = path.resolve(process.cwd(), sourceFile);
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`target file not exist: ${sourceFile}`);
  }
  const registry = createMetaSourceRegistry(assetsDir);
  const metaHandlers = await resolveMetaHandlers(registry, {
    ...options,
    allowSelect: true,
    selectTips: ['Select target meta source for add'],
  });
  await alignMetaWithAssets(metaHandlers);

  await addAsset(metaHandlers, [{sourcePath: sourceFile, targetPath: target}], {
    runDirectly: options?.runDirectly,
  });
}
