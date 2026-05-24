import {updateMetaHandlerMeta, backupAssets, runAssetsSyncCommand} from '../external';
import {
  getDefaultMetaHandler,
  getPrimaryMetaHandler,
  parseSyncTarget,
  type AssetsMetaRunDirectlyCliOptions,
} from '../service';

export async function runAssetsPullCommand(
  assetsDir: string,
  target: string,
  options?: AssetsMetaRunDirectlyCliOptions
) {
  const {meta} = options ?? {};
  const metaHandler = await getDefaultMetaHandler(assetsDir, meta);
  await updateMetaHandlerMeta(metaHandler);

  const parsed = parseSyncTarget(target);
  if (parsed.kind === 'local') {
    const targetHandlers = await getPrimaryMetaHandler(parsed.path);
    await backupAssets(metaHandler, targetHandlers, {runDirectly: options?.runDirectly});
    return;
  }

  const {host, port} = parsed;
  await runAssetsSyncCommand('pull', assetsDir, {
    host,
    port,
    runDirectly: options?.runDirectly,
  });
}
