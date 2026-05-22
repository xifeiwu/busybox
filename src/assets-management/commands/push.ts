import {alignMetaWithAssets, backupAssets, runAssetsSyncCommand} from '../external';
import {
  createMetaSourceRegistry,
  getPrimaryMetaHandlers,
  parseSyncTarget,
  type AssetsMetaRunDirectlyCliOptions,
} from '../meta-source';

export async function runAssetsPushCommand(
  assetsDir: string,
  target: string,
  options?: AssetsMetaRunDirectlyCliOptions
) {
  const registry = createMetaSourceRegistry(assetsDir);
  const localHandlers = await getPrimaryMetaHandlers(registry);
  await alignMetaWithAssets(localHandlers);

  const parsed = parseSyncTarget(target);
  if (parsed.kind === 'local') {
    const targetRegistry = createMetaSourceRegistry(parsed.path);
    const targetHandlers = await getPrimaryMetaHandlers(targetRegistry);
    await backupAssets(targetHandlers, localHandlers, {runDirectly: options?.runDirectly});
    return;
  }

  const {host, port} = parsed;
  await runAssetsSyncCommand('push', registry.assetsDir, {
    host,
    port,
    runDirectly: options?.runDirectly,
  });
}
