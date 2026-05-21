import fs from 'fs';
import path from 'path';
import {rerequire, getMetaDir} from '../external';
import type {
  DbMetaSourceFileExport,
  LocalMetaSourceFileExport,
  MetaSourceKind,
  ParsedMetaSource,
  SequelizeConfig,
} from './types';

const META_SOURCE_FILENAME_RE = /^(local|sqlite|mysql)(?:_(.+))?\.(js|ts)$/;

function parseMetaSourceFilename(filename: string): {kind: MetaSourceKind} | null {
  const match = filename.match(META_SOURCE_FILENAME_RE);
  if (!match) {
    return null;
  }
  return {kind: match[1] as MetaSourceKind};
}

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

function readPriority(raw: Record<string, unknown>, fileLabel: string): number {
  if (raw.priority === undefined) {
    return 0;
  }
  if (typeof raw.priority !== 'number' || !Number.isFinite(raw.priority)) {
    throw new Error(`Invalid priority in ${fileLabel}: must be a finite number`);
  }
  return raw.priority;
}

function readKeyFromFileName(fileLabel: string): string {
  return path.basename(fileLabel, path.extname(fileLabel));
}

function parseLocalMetaSource(filePath: string, fileLabel: string): ParsedMetaSource {
  const raw = unwrapExport(rerequire(filePath));
  const local = raw as unknown as LocalMetaSourceFileExport;
  if (local.meta === undefined) {
    throw new Error(`Local meta source ${fileLabel} must export "meta"`);
  }
  return {
    kind: 'local',
    key: readKeyFromFileName(fileLabel),
    metaFilePath: filePath,
    priority: readPriority(raw, fileLabel),
  };
}

function parseDbMetaSource(kind: 'sqlite' | 'mysql', filePath: string, fileLabel: string): ParsedMetaSource {
  const raw = unwrapExport(rerequire(filePath));
  const db = raw as unknown as DbMetaSourceFileExport;
  if (!db.config || typeof db.config !== 'object') {
    throw new Error(`${kind} meta source ${fileLabel} must export "config"`);
  }
  const config = db.config as SequelizeConfig;
  if (config.dialect !== kind) {
    throw new Error(`${fileLabel}: config.dialect must be "${kind}", got "${String(config.dialect)}"`);
  }
  const base = {
    key: readKeyFromFileName(fileLabel),
    config,
    priority: readPriority(raw, fileLabel),
  };
  return kind === 'sqlite' ? {kind: 'sqlite', ...base} : {kind: 'mysql', ...base};
}

function loadMetaSourceConfigs(assetsDir: string): ParsedMetaSource[] {
  const metaDir = getMetaDir(assetsDir);
  if (!fs.existsSync(metaDir)) {
    return [];
  }
  const sources: ParsedMetaSource[] = [];
  for (const name of fs.readdirSync(metaDir).sort()) {
    const parsed = parseMetaSourceFilename(name);
    if (!parsed) {
      continue;
    }
    const filePath = path.join(metaDir, name);
    const fileLabel = name;
    if (parsed.kind === 'local') {
      sources.push(parseLocalMetaSource(filePath, fileLabel));
    } else {
      sources.push(parseDbMetaSource(parsed.kind, filePath, fileLabel));
    }
  }
  return sources;
}

function assertUniqueKeys(sources: ParsedMetaSource[]) {
  const seen = new Set<string>();
  for (const source of sources) {
    if (seen.has(source.key)) {
      throw new Error(`Duplicate meta source key "${source.key}" under .meta/`);
    }
    seen.add(source.key);
  }
}

/**
 * as readMetaFromDir and saveDirMeta in modules/lib/node/lib/assets-management/service/assets-meta.ts
 * will use local.js as its name, this fallback function will not needed.
 */
function getFallbackMetaSources(assetsDir: string): ParsedMetaSource[] {
  const indexTs = path.join(getMetaDir(assetsDir), 'index.ts');
  if (fs.existsSync(indexTs)) {
    return [{kind: 'local', key: 'default', metaFilePath: indexTs, priority: 0}];
  }
  return [{kind: 'local', key: 'default', metaFilePath: '', priority: 0}];
}

export function sortMetaSources(sources: ParsedMetaSource[]): ParsedMetaSource[] {
  return [...sources].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return a.key.localeCompare(b.key);
  });
}

export function resolveMetaSourceEntries(assetsDir: string): ParsedMetaSource[] {
  const loaded = loadMetaSourceConfigs(assetsDir);
  const sources = loaded.length > 0 ? loaded : getFallbackMetaSources(assetsDir);
  assertUniqueKeys(sources);
  return sortMetaSources(sources);
}
