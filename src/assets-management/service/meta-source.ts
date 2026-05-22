import fs from 'fs';
import path from 'path';
import {rerequire, META_DIR_NAME, getMetaDir, MetaFileContent, selectOption, MetaHandlers} from '../external';
import {META_SOURCE_FILENAME_RE} from './constants';
import type {DbMetaSourceFileExport, MetaSourceKind, ParsedMetaSource, SequelizeConfig} from './types';
import {getMetaHandlersForSource} from './resolve-handler';

function unwrapExport(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  const obj = raw as {default?: unknown};
  const inner = obj.default !== undefined ? obj.default : raw;
  if (!inner || typeof inner !== 'object') {
    return {};
  }
  return inner as Record<string, unknown>;
}

function parseLocalMetaSource(filePath: string, moreInfo: {defaultPriority?: number}): ParsedMetaSource {
  const {defaultPriority} = moreInfo;
  const raw = unwrapExport(rerequire(filePath));
  const local = raw as unknown as MetaFileContent;
  if (local.meta === undefined) {
    throw new Error(`Local meta source must export "meta"`);
  }
  return {
    kind: 'local',
    key: path.basename(filePath, path.extname(filePath)),
    metaFilePath: filePath,
    priority: local.priority ?? defaultPriority,
  };
}

function parseDbMetaSource(
  filePath: string,
  moreInfo: {
    kind: 'sqlite' | 'mysql';
    defaultPriority?: number;
  }
): ParsedMetaSource {
  const {kind, defaultPriority = 0} = moreInfo;
  const raw = unwrapExport(rerequire(filePath));
  const db = raw as unknown as DbMetaSourceFileExport;
  if (!db.config || typeof db.config !== 'object') {
    throw new Error(`${kind} meta source must export "config"`);
  }
  // TODO: support db_key
  const config = db.config as SequelizeConfig;
  if (config.dialect !== kind) {
    throw new Error(`config.dialect must be "${kind}", got "${String(config.dialect)}"`);
  }
  const base = {
    config,
    priority: (raw.priority as number) ?? defaultPriority,
  };
  const key = path.basename(filePath, path.extname(filePath));
  return kind === 'sqlite' ? {kind: 'sqlite', key, ...base} : {kind: 'mysql', key, ...base};
}

/**
 * By default, local meta source has the highest priority, so we set 100 as its default priority.
 * If want to use some other meta source as the primary, you can set a higher priority for it.
 * @param assetsDir
 * @returns
 */
function loadMetaSourceConfigs(assetsDir: string): ParsedMetaSource[] {
  const metaDir = getMetaDir(assetsDir);
  if (!fs.existsSync(metaDir)) {
    return [];
  }
  return fs
    .readdirSync(metaDir)
    .sort()
    .flatMap(name => {
      const match = name.match(META_SOURCE_FILENAME_RE);
      const kind = match ? (match[1] as MetaSourceKind) : null;
      if (!kind) {
        return [];
      }
      const filePath = path.join(metaDir, name);
      if (kind === 'local') {
        return [parseLocalMetaSource(filePath, {defaultPriority: 100})];
      }
      return [parseDbMetaSource(filePath, {kind})];
    });
}

export function getMetaSourceList(assetsDir: string): ParsedMetaSource[] {
  const sources = loadMetaSourceConfigs(assetsDir);
  if (sources.length === 0) {
    throw new Error(`No meta source found in ${assetsDir}, please init meta first`);
  }
  const sorted = sources.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
  });
  return sorted;
}

export function getPrimaryMetaSourceKey(assetsDir: string): string {
  const sources = getMetaSourceList(assetsDir);
  return sources[0].key;
}

export function getPrimaryMetaSource(assetsDir: string): ParsedMetaSource {
  const sources = getMetaSourceList(assetsDir);
  return sources[0];
}
export async function getPrimaryMetaHandlers(assetsDir: string): Promise<MetaHandlers> {
  const source = getPrimaryMetaSource(assetsDir);
  return await getMetaHandlersForSource(source, assetsDir);
}

interface SelectMetaSourceOptions {
  meta?: string;
  excludeKeys?: string[];
  selectTips?: string[];
}
export async function selectMetaSource(
  assetsDir: string,
  options?: SelectMetaSourceOptions
): Promise<ParsedMetaSource> {
  const {selectTips: tips = ['Select meta source'], excludeKeys = [], meta} = options ?? {};
  const sources = getMetaSourceList(assetsDir);
  const candidates = sources.filter(it => !excludeKeys.includes(it.key));
  if (meta) {
    const target = candidates.find(it => it.key === meta);
    if (target) {
      return target;
    }
  }
  if (candidates.length === 0) {
    throw new Error('No meta source available to select');
  }
  if (candidates.length === 1) {
    return candidates[0];
  }
  const {value} = await selectOption<{label: string; value: ParsedMetaSource}>(
    candidates.map(it => ({label: `${it.key} [${it.kind}, priority ${it.priority}]`, value: it})),
    {tips}
  );
  return value;
}

export async function selectMetaHandler(
  assetsDir: string,
  options?: SelectMetaSourceOptions
): Promise<MetaHandlers> {
  const source = await selectMetaSource(assetsDir, options);
  return await getMetaHandlersForSource(source, assetsDir);
}

export async function getMetaSourceByKey(assetsDir: string, key: string): Promise<ParsedMetaSource> {
  const sources = getMetaSourceList(assetsDir);
  const source = sources.find(it => it.key === key);
  if (!source) {
    throw new Error(`Unknown meta source "${key}". Available: ${sources.map(it => it.key).join(', ')}`);
  }
  return source;
}

export async function getMetaHandlersByKey(assetsDir: string, key: string): Promise<MetaHandlers> {
  const source = await getMetaSourceByKey(assetsDir, key);
  return await getMetaHandlersForSource(source, assetsDir);
}
