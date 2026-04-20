import fs from 'fs';
import {
  listProcKeyInfo,
  readProcInfo,
  startProcess,
  killProc,
  restartProcess,
  removeProcBaseDir,
  tailProcessOutLog,
  getProcKeyInfo,
} from '../../modules/lib/node/lib/process-manager/service';
import {PROCESS_MANAGER_ROOT_DIR} from '../../modules/lib/node/service/constants';
import {selectOption} from '../../modules/lib/node/readline';
import {selectConfigById} from '../2-process';

function listManagedDirIds(): string[] {
  if (!fs.existsSync(PROCESS_MANAGER_ROOT_DIR)) {
    return [];
  }
  return fs
    .readdirSync(PROCESS_MANAGER_ROOT_DIR, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .map(e => e.name);
}

async function selectRunningOrRegisteredId(id?: string): Promise<string> {
  const ids = listManagedDirIds();
  if (id && ids.includes(id)) {
    return id;
  }
  if (ids.length === 0) {
    throw new Error('No managed processes found (empty process-manager root).');
  }
  const selected = await selectOption(ids.map(x => ({label: x, id: x})));
  return selected.id;
}

export async function list() {
  return await listProcKeyInfo();
}
export async function info(id?: string) {
  const cpId = await selectRunningOrRegisteredId(id);
  const info = await getProcKeyInfo(cpId);
  if (!info) {
    throw new Error(`No info file for process: ${cpId}`);
  }
  return {cpId, info};
}

export async function detail(id?: string) {
  const cpId = await selectRunningOrRegisteredId(id);
  return {cpId, info: readProcInfo(cpId)};
}

export async function start(id?: string) {
  const config = await selectConfigById(id);
  return {cpId: config.id, result: await startProcess(config)};
}

export async function stop(id?: string, clean?: boolean) {
  const cpId = await selectRunningOrRegisteredId(id);
  const killedPids = await killProc(cpId, {cleanUp: clean});
  return {cpId, killedPids, cleaned: Boolean(clean)};
}

export async function restart(id?: string, clean?: boolean) {
  const config = await selectConfigById(id);
  return {cpId: config.id, result: await restartProcess(config, {cleanUp: clean})};
}

export async function clean(id?: string) {
  const cpId = await selectRunningOrRegisteredId(id);
  await removeProcBaseDir(cpId);
  return {cpId};
}

export async function log(id?: string) {
  const cpId = await selectRunningOrRegisteredId(id);
  await tailProcessOutLog(cpId);
  return {cpId};
}
