import fs from 'fs';
import path from 'path';
import {
  createMetaSourceRegistry,
  getMetaHandlersByKey,
  getPrimaryMetaHandlers,
  selectMetaSourceHandlers,
  type MetaSourceRegistry,
} from '../meta-source';
import type {MetaHandlers} from '../external';

export interface AssetsCommandOptions {
  meta?: string;
  runDirectly?: boolean;
}

export function createRegistry(dir: string): MetaSourceRegistry {
  dir = path.resolve(process.cwd(), dir);
  return createMetaSourceRegistry(dir);
}

export async function resolveMetaHandlers(
  registry: MetaSourceRegistry,
  options?: AssetsCommandOptions & {selectTips?: string[]; allowSelect?: boolean}
): Promise<MetaHandlers> {
  if (options?.meta) {
    return getMetaHandlersByKey(registry, options.meta);
  }
  if (options?.allowSelect && registry.entries.length > 1) {
    const {handlers} = await selectMetaSourceHandlers(registry, {tips: options.selectTips});
    return handlers;
  }
  return getPrimaryMetaHandlers(registry);
}

export function parseSyncTarget(target?: string): {
  kind: 'local' | 'remote';
  path?: string;
  host?: string;
  port?: number;
} {
  if (!target) {
    return {kind: 'remote'};
  }
  const abs = path.resolve(process.cwd(), target);
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
    return {kind: 'local', path: abs};
  }
  const hostPort = target.match(/^([^:]+)(?::(\d+))?$/);
  if (hostPort) {
    return {
      kind: 'remote',
      host: hostPort[1],
      port: hostPort[2] ? parseInt(hostPort[2], 10) : undefined,
    };
  }
  throw new Error(`Invalid sync target: ${target}. Use a local directory path or host[:port].`);
}

export function getRemoteHostPort(
  target: ReturnType<typeof parseSyncTarget>,
  opts: {host?: string; port?: string}
): {host: string; port: string} {
  const host = target.host ?? opts.host ?? '127.0.0.1';
  const port = String(target.port ?? opts.port ?? 80);
  return {host, port};
}
