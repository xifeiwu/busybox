import fs from 'fs';
import path from 'path';
import {addAsset, alignMetaWithAssets, resolvePathInRoot} from '../external';
import {createMetaSourceRegistry, resolveMetaHandlers, type AssetsCommandOptions} from '../meta-source';

export interface AssetsAddOptions extends AssetsCommandOptions {
  to?: string;
}

export async function runAssetsAddCommand(
  assetsDir: string,
  sourceFile: string | undefined,
  options?: AssetsAddOptions
) {
  if (!sourceFile) {
    return;
  }
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

  await addAsset(metaHandlers, [{sourcePath: sourceFile}], {
    runDirectly: options?.runDirectly,
  });
}
