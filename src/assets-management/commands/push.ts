import {alignMetaWithAssets, backupAssets, runAssetsSyncCommand} from '../external';
import {
  getDefaultMetaHandler,
  getPrimaryMetaHandler,
  parseSyncTarget,
  type AssetsMetaRunDirectlyCliOptions,
} from '../service';

export async function runAssetsPushCommand(
  assetsDir: string,
  target: string,
  options?: AssetsMetaRunDirectlyCliOptions
) {
  const {meta} = options ?? {};

  const metaHandler = await getDefaultMetaHandler(assetsDir, meta);
  await alignMetaWithAssets(metaHandler);

  const parsed = parseSyncTarget(target);
  if (parsed.kind === 'local') {
    const targetHandlers = await getPrimaryMetaHandler(parsed.path);
    await backupAssets(targetHandlers, metaHandler, {runDirectly: options?.runDirectly});
    return;
  }

  const {host, port} = parsed;
  await runAssetsSyncCommand('push', assetsDir, {
    host,
    port,
    runDirectly: options?.runDirectly,
  });
}
