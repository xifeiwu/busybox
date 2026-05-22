import {alignMetaWithAssets, backupAssets, runAssetsSyncCommand} from '../external';
import {
  getMetaHandlersByKey,
  getPrimaryMetaHandlers,
  parseSyncTarget,
  type AssetsMetaRunDirectlyCliOptions,
} from '../service';

export async function runAssetsPushCommand(
  assetsDir: string,
  target: string,
  options?: AssetsMetaRunDirectlyCliOptions
) {
  const {meta} = options ?? {};
  const metaHandlers = meta
    ? await getMetaHandlersByKey(assetsDir, meta)
    : await getPrimaryMetaHandlers(assetsDir);
  await alignMetaWithAssets(metaHandlers);

  const parsed = parseSyncTarget(target);
  if (parsed.kind === 'local') {
    const targetHandlers = await getPrimaryMetaHandlers(parsed.path);
    await backupAssets(targetHandlers, metaHandlers, {runDirectly: options?.runDirectly});
    return;
  }

  const {host, port} = parsed;
  await runAssetsSyncCommand('push', assetsDir, {
    host,
    port,
    runDirectly: options?.runDirectly,
  });
}
