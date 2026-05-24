import fs from 'fs';
import path from 'path';
import {addAsset, updateMetaHandlerMeta, printIgnoredAssets, printOperatedAssets} from '../external';
import {getDefaultMetaHandler, type AssetsMetaRunDirectlyCliOptions} from '../service';

export async function runAssetsAddCommand(
  assetsDir: string,
  source: string,
  target?: string,
  options?: AssetsMetaRunDirectlyCliOptions
) {
  source = path.resolve(process.cwd(), source);
  if (!fs.existsSync(source)) {
    throw new Error(`source file not exist: ${source}`);
  }
  const {meta} = options ?? {};
  const metaHandler = await getDefaultMetaHandler(assetsDir, meta);
  await updateMetaHandlerMeta(metaHandler);

  const {results, ignored} = await addAsset(metaHandler, [{sourcePath: source, targetPath: target}], {
    runDirectly: options?.runDirectly,
  });
  printOperatedAssets(results);
  printIgnoredAssets(ignored);
  // console.log('results', results);
}
