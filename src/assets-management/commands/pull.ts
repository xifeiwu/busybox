import {alignMetaWithAssets, backupAssets, runAssetsSyncCommand} from '../external';
import {
  createMetaSourceRegistry,
  createMetaSourceRegistry,
  getPrimaryMetaHandlers,
  parseSyncTarget,
  type AssetsCommandOptions,
} from '../meta-source';

export async function runAssetsPullCommand(
  assetsDir: string,
  target: string,
  options?: AssetsCommandOptions
) {
  const registry = createMetaSourceRegistry(assetsDir);
  const localHandlers = await getPrimaryMetaHandlers(registry);
  await alignMetaWithAssets(localHandlers);

  const parsed = parseSyncTarget(target);
  if (parsed.kind === 'local') {
    const targetRegistry = createMetaSourceRegistry(parsed.path);
    const targetHandlers = await getPrimaryMetaHandlers(targetRegistry);
    await backupAssets(localHandlers, targetHandlers, {runDirectly: options?.runDirectly});
    return;
  }

  const {host, port} = parsed;
  await runAssetsSyncCommand('pull', registry.assetsDir, {
    host,
    port,
    runDirectly: options?.runDirectly,
  });
}
