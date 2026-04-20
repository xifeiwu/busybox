import fs from 'fs';
import {selectOption, killProcessByPid} from '../service/external';
import {isProcessAlive} from '../../modules/lib/node/process/service/kill';
import {launchCpInDetachedMode} from '../../modules/lib/node/lib/process-manager/launch-cp/detached';
import {launchCpInMonitoredMode} from '../../modules/lib/node/lib/process-manager/launch-cp/monitored';
import {
  getAllProcKeyInfo,
  readProcInfo,
  getProcBaseDir,
  getProcInfoDir,
  getProcLogDir,
  tailProcessOutLog,
} from '../../modules/lib/node/lib/process-manager/service';
import {DAEMON_ROOT_DIR} from '../../modules/lib/node/lib/process-manager/service/external';
import {selectConfigId} from '../2-process';

export function listManagedDirIds(): string[] {
  if (!fs.existsSync(DAEMON_ROOT_DIR)) {
    return [];
  }
  return fs
    .readdirSync(DAEMON_ROOT_DIR, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .map(e => e.name);
}

export async function selectRunningOrRegisteredId(id?: string): Promise<string> {
  const ids = listManagedDirIds();
  if (id && ids.includes(id)) {
    return id;
  }
  if (ids.length === 0) {
    throw new Error('No managed processes found (empty process-manager root).');
  }
  const selected = await selectOption(
    ids.map(x => ({
      label: x,
      id: x,
    }))
  );
  return selected.id;
}

export async function listProcessesKeyInfo() {
  return await getAllProcKeyInfo();
}

export async function infoProcess(id?: string) {
  const cpId = await selectRunningOrRegisteredId(id);
  return readProcInfo(cpId);
}

export async function startProcess(id?: string) {
  const config = await selectConfigId(id);
  return config.monitorConfig ? await launchCpInMonitoredMode(config) : await launchCpInDetachedMode(config);
}

async function killPersistedProcess(cpId: string): Promise<number[]> {
  const info = readProcInfo(cpId);
  if (!info) return [];
  const pids: number[] = [];
  const mon = info.monitor?.id;
  const sp = info.spawn?.pid;
  if (mon != null && sp != null && mon !== sp && isProcessAlive(mon)) {
    pids.push(mon);
  }
  if (sp != null && isProcessAlive(sp)) {
    pids.push(sp);
  }
  if (pids.length > 0) {
    await killProcessByPid(pids);
  }
  return pids;
}

export async function stopProcess(id?: string, clean?: boolean) {
  const cpId = await selectRunningOrRegisteredId(id);
  const killedPids = await killPersistedProcess(cpId);
  if (clean) {
    fs.rmSync(getProcBaseDir(cpId), {recursive: true, force: true});
  }
  return {cpId, killedPids, cleaned: Boolean(clean)};
}

export async function restartProcess(id?: string, clean?: boolean) {
  const cpId = await selectRunningOrRegisteredId(id);
  await killPersistedProcess(cpId);
  if (clean) {
    fs.rmSync(getProcBaseDir(cpId), {recursive: true, force: true});
  }
  return await startProcess(cpId);
}

export async function cleanupProc(id?: string) {
  const cpId = await selectRunningOrRegisteredId(id);
  await killPersistedProcess(cpId);
  const infoDir = getProcInfoDir(cpId);
  const logDir = getProcLogDir(cpId);
  if (fs.existsSync(infoDir)) {
    fs.rmSync(infoDir, {recursive: true, force: true});
  }
  if (fs.existsSync(logDir)) {
    fs.rmSync(logDir, {recursive: true, force: true});
  }
  return {cpId};
}

export async function logProcess(id?: string) {
  const cpId = await selectRunningOrRegisteredId(id);
  await tailProcessOutLog(cpId);
}
