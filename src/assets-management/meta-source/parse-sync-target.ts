import fs from 'fs';
import path from 'path';

const DEFAULT_REMOTE_PORT = 80;

export type SyncTarget = {kind: 'local'; path: string} | {kind: 'remote'; host: string; port: number};

/**
 * Parse push/pull target: local directory path, or remote `host` / `host:port`.
 * Omit target → remote default host:port.
 */
export function parseSyncTarget(target: string): SyncTarget {
  if (!target) {
    throw new Error('target is required');
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
      port: hostPort[2] ? parseInt(hostPort[2], 10) : DEFAULT_REMOTE_PORT,
    };
  }
  throw new Error(`Invalid sync target: ${target}. Use a local directory path or host[:port].`);
}
