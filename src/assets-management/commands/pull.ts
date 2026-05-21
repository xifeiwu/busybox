import {alignMetaWithAssets, backupAssets, runAssetsSyncCommand} from '../external';
import {createMetaSourceRegistry, getPrimaryMetaHandlers} from '../meta-source';
import {createRegistry, getRemoteHostPort, parseSyncTarget} from './shared';
import type {AssetsPushPullOptions} from './push';

export async function runAssetsPullCommand(
  assetsDir: string,
  target: string | undefined,
  options?: AssetsPushPullOptions
) {
  const registry = createRegistry(assetsDir);
  const localHandlers = await getPrimaryMetaHandlers(registry);
  await alignMetaWithAssets(localHandlers);

  const parsed = parseSyncTarget(target);
  if (parsed.kind === 'local') {
    const targetRegistry = createMetaSourceRegistry(parsed.path!);
    const targetHandlers = await getPrimaryMetaHandlers(targetRegistry);
    await backupAssets(localHandlers, targetHandlers, {runDirectly: options?.runDirectly});
    return;
  }

  const {host, port} = getRemoteHostPort(parsed, options ?? {});
  await runAssetsSyncCommand('pull', registry.assetsDir, {
    host,
    port,
    runDirectly: options?.runDirectly,
  });
}
