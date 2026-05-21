import {alignMetaWithAssets, backupAssets, runAssetsSyncCommand} from '../external';
import {createMetaSourceRegistry, getPrimaryMetaHandlers} from '../meta-source';
import {createRegistry, getRemoteHostPort, parseSyncTarget, type AssetsCommandOptions} from './shared';

export interface AssetsPushPullOptions extends AssetsCommandOptions {
  host?: string;
  port?: string;
}

export async function runAssetsPushCommand(
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
    await backupAssets(targetHandlers, localHandlers, {runDirectly: options?.runDirectly});
    return;
  }

  const {host, port} = getRemoteHostPort(parsed, options ?? {});
  await runAssetsSyncCommand('push', registry.assetsDir, {
    host,
    port,
    runDirectly: options?.runDirectly,
  });
}
