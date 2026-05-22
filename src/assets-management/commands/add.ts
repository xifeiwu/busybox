import fs from 'fs';
import path from 'path';
import {addAsset, alignMetaWithAssets} from '../external';
import {
  getMetaHandlersByKey,
  getPrimaryMetaHandlers,
  selectMetaHandler,
  type AssetsMetaRunDirectlyCliOptions,
} from '../service';

export async function runAssetsAddCommand(
  assetsDir: string,
  source: string,
  target?: string,
  options?: AssetsMetaRunDirectlyCliOptions
) {
  source = path.resolve(process.cwd(), source);
  if (!fs.existsSync(source)) {
    throw new Error(`target file not exist: ${source}`);
  }
  const {meta} = options ?? {};
  const metaHandlers = meta
    ? await getMetaHandlersByKey(assetsDir, meta)
    : await getPrimaryMetaHandlers(assetsDir);
  await alignMetaWithAssets(metaHandlers);

  await addAsset(metaHandlers, [{sourcePath: source, targetPath: target}], {
    runDirectly: options?.runDirectly,
  });
}
