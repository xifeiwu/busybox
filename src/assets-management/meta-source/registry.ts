import path from 'path';
import fs from 'fs';
import {selectOption} from '../external';
import type {MetaHandlers} from '../external';
import type {ParsedMetaSource} from './types';
import {resolveMetaSourceEntries} from './load-config';
import {getMetaHandlersForSource} from './resolve-handler';

export interface MetaSourceRegistry {
  assetsDir: string;
  entries: ParsedMetaSource[];
}

export function createMetaSourceRegistry(assetsDir: string): MetaSourceRegistry {
  const absDir = path.resolve(assetsDir);
  if (!fs.existsSync(absDir)) {
    throw new Error(`Assets directory does not exist: ${absDir}`);
  }
  if (!fs.statSync(absDir).isDirectory()) {
    throw new Error(`Not a directory: ${absDir}`);
  }
  return {
    assetsDir: absDir,
    entries: resolveMetaSourceEntries(absDir),
  };
}

function getPrimarySource(registry: MetaSourceRegistry): ParsedMetaSource {
  return registry.entries[0];
}

export async function getPrimaryMetaHandlers(registry: MetaSourceRegistry): Promise<MetaHandlers> {
  return getMetaHandlersForSource(getPrimarySource(registry), registry.assetsDir);
}

export async function getMetaHandlersByKey(registry: MetaSourceRegistry, key: string): Promise<MetaHandlers> {
  const source = registry.entries.find(it => it.key === key);
  if (!source) {
    throw new Error(
      `Unknown meta source "${key}". Available: ${registry.entries.map(it => it.key).join(', ')}`
    );
  }
  return getMetaHandlersForSource(source, registry.assetsDir);
}

function formatSourceLabel(source: ParsedMetaSource): string {
  return `${source.key} [${source.kind}, priority ${source.priority}]`;
}

export async function selectMetaSource(
  registry: MetaSourceRegistry,
  options?: {
    tips?: string[];
    excludeKeys?: string[];
  }
): Promise<ParsedMetaSource> {
  const {tips = ['Select meta source'], excludeKeys = []} = options ?? {};
  const candidates = registry.entries.filter(it => !excludeKeys.includes(it.key));
  if (candidates.length === 0) {
    throw new Error('No meta source available to select');
  }
  if (candidates.length === 1) {
    return candidates[0];
  }
  const {value} = await selectOption<{label: string; value: ParsedMetaSource}>(
    candidates.map(it => ({label: formatSourceLabel(it), value: it})),
    {tips}
  );
  return value;
}

export async function selectMetaSourceHandlers(
  registry: MetaSourceRegistry,
  options?: Parameters<typeof selectMetaSource>[1]
): Promise<{source: ParsedMetaSource; handlers: MetaHandlers}> {
  selectOption;
  const source = await selectMetaSource(registry, options);
  const handlers = await getMetaHandlersForSource(source, registry.assetsDir);
  return {source, handlers};
}
