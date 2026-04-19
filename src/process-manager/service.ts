import fs from 'fs';
import {logColorful, selectOption, LaunchCpConfig, killProcessByPid} from '../service/external';
import {isProcessAlive} from '../../modules/lib/node/process/service/kill';
import {launchCpInDetachedMode} from '../../modules/lib/node/lib/process-manager/launch-cp/detached';
import {launchCpInMonitoredMode} from '../../modules/lib/node/lib/process-manager/launch-cp/monitored';
import {
  getAllProcKeyInfo,
  readProcInfo,
  getProcBaseDir,
  tailProcessOutLog,
} from '../../modules/lib/node/lib/process-manager/service';
import {DAEMON_ROOT_DIR} from '../../modules/lib/node/lib/process-manager/service/external';
import {debugServer, tlsGateway, tcpGateway} from '../2-process/config';

export const cpEntryMap = [debugServer, tlsGateway, tcpGateway].reduce<{
  [key: string]: LaunchCpConfig;
}>((sum, fn) => {
  const entry = fn();
  return {...sum, [entry.id]: entry};
}, {});

const configIdList = Object.keys(cpEntryMap);

export function listManagedDirIds(): string[] {
  if (!fs.existsSync(DAEMON_ROOT_DIR)) {
    return [];
  }
  return fs
    .readdirSync(DAEMON_ROOT_DIR, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .map(e => e.name);
}

export async function selectConfigId(id?: string): Promise<string> {
  if (id && configIdList.includes(id)) {
    return id;
  }
  if (id && !configIdList.includes(id)) {
    logColorful({color: 'yellow'}, `Unknown config id "${id}", choose from list.`);
  }
  const selected = await selectOption(
    configIdList.map(x => ({
      label: x,
      id: x,
    }))
  );
  return selected.id;
}

export async function selectRunningOrRegisteredId(id?: string): Promise<string> {
  const ids = listManagedDirIds();
  if (id && ids.includes(id)) {
    return id;
  }
  if (id && !ids.includes(id)) {
    logColorful({color: 'yellow'}, `Unknown process id "${id}", choose from list.`);
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

export async function listProcesses(): Promise<Awaited<ReturnType<typeof getAllProcKeyInfo>>> {
  const rows = await getAllProcKeyInfo();
  logColorful({}, rows);
  return rows;
}

export async function infoProcess(id?: string): Promise<void> {
  const cpId = await selectRunningOrRegisteredId(id);
  const info = readProcInfo(cpId);
  if (!info) {
    logColorful({color: 'yellow'}, `No info file for process: ${cpId}`);
    return;
  }
  logColorful({}, info);
}

export async function startProcess(id?: string): Promise<void> {
  const cpId = await selectConfigId(id);
  const entry = cpEntryMap[cpId];
  if (!entry) {
    throw new Error(`No config found for id: ${cpId}`);
  }
  const result = entry.monitorConfig
    ? await launchCpInMonitoredMode(entry)
    : await launchCpInDetachedMode(entry);
  logColorful({}, result);
}

async function killPersistedProcess(cpId: string): Promise<void> {
  const info = readProcInfo(cpId);
  if (!info) {
    logColorful({color: 'yellow'}, `No persisted info for: ${cpId}`);
    return;
  }
  const pids: number[] = [];
  const mon = info.monitor?.id;
  const sp = info.spawn?.pid;
  if (mon != null && sp != null && mon !== sp && isProcessAlive(mon)) {
    pids.push(mon);
  }
  if (sp != null && isProcessAlive(sp)) {
    pids.push(sp);
  }
  if (pids.length === 0) {
    logColorful({color: 'yellow'}, `Process ${cpId} is not running.`);
    return;
  }
  await killProcessByPid(pids);
  logColorful({}, `Process ${cpId} stopped.`);
}

export async function stopProcess(id?: string, clean?: boolean): Promise<void> {
  const cpId = await selectRunningOrRegisteredId(id);
  await killPersistedProcess(cpId);
  if (clean) {
    fs.rmSync(getProcBaseDir(cpId), {recursive: true, force: true});
    logColorful({}, `Removed base folder for ${cpId}.`);
  }
}

export async function restartProcess(id?: string, clean?: boolean): Promise<void> {
  const cpId = await selectRunningOrRegisteredId(id);
  await killPersistedProcess(cpId);
  if (clean) {
    fs.rmSync(getProcBaseDir(cpId), {recursive: true, force: true});
    logColorful({}, `Removed base folder for ${cpId}.`);
  }
  await startProcess(cpId);
}

export async function logProcess(id?: string): Promise<void> {
  const cpId = await selectRunningOrRegisteredId(id);
  await tailProcessOutLog(cpId);
}
