import {alignMetaWithAssets, backupAssets, runAssetsSyncCommand} from '../external';
import {
  getMetaHandlersByKey,
  getPrimaryMetaHandlers,
  parseSyncTarget,
  type AssetsMetaRunDirectlyCliOptions,
} from '../service';

export async function runAssetsPullCommand(
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
    // const targetRegistry = createMetaSourceRegistry(parsed.path);
    const targetHandlers = await getPrimaryMetaHandlers(parsed.path);
    await backupAssets(metaHandlers, targetHandlers, {runDirectly: options?.runDirectly});
    return;
  }

  const {host, port} = parsed;
  await runAssetsSyncCommand('pull', assetsDir, {
    host,
    port,
    runDirectly: options?.runDirectly,
  });
}
