import fs from 'fs';
import {
  logColorful,
  selectOption,
  LaunchCpEntry,
  isCpAlive,
  stopCp,
} from '../service/external';
import {launchCpInDetachedMode} from '../../modules/lib/node/lib/process-manager/launch-cp/detached';
import {readProcInfo} from '../../modules/lib/node/lib/process-manager/service';
import {DAEMON_ROOT_DIR} from '../../modules/lib/node/lib/process-manager/service/external';
import {tlsGateway, tcpGateway, debugServer} from '../2-process-config/config';

function loadAllCpInfo(): {cpId: string; info: ReturnType<typeof readProcInfo>}[] {
  if (!fs.existsSync(DAEMON_ROOT_DIR)) {
    return [];
  }
  return fs
    .readdirSync(DAEMON_ROOT_DIR, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .map(e => ({
      cpId: e.name,
      info: readProcInfo(e.name),
    }));
}

export const cpWrapperConfigMap = [debugServer, tlsGateway, tcpGateway].reduce<{
  [key: string]: LaunchCpEntry;
}>((sum, func) => {
  const entry = func();
  return {
    ...sum,
    [entry.cpConfig.id]: entry,
  };
}, {});
const idList = Object.values(cpWrapperConfigMap).map(it => it.cpConfig.id);

export async function getId(id?: string) {
  if (idList.includes(id)) {
    return id;
  }
  const selected = await selectOption(
    idList.map(id => {
      return {
        label: id,
        id,
      };
    })
  );
  return selected.id;
}

export async function info(id?: string) {
  if (id) {
    const allInfo = loadAllCpInfo();
    const match = allInfo.find(it => it.cpId === id);
    if (!match?.info) {
      logColorful({color: 'red'}, `No info found for id: ${id}`);
      return null;
    }
    logColorful({}, match.info);
    return match.info;
  }
  const allInfo = loadAllCpInfo();
  logColorful({}, allInfo);
  return allInfo;
}

export async function start(id?: string) {
  id = await getId(id);
  const entry = cpWrapperConfigMap[id];
  if (!entry) {
    throw new Error(`No config found for id: ${id}`);
  }
  const result = await launchCpInDetachedMode(entry.cpConfig);
  logColorful({}, result);
  return result;
}

export async function restart(id?: string) {
  id = await getId(id);
  await stop(id);
  return await start(id);
}

export async function stop(id?: string) {
  id = await getId(id);
  if (!isCpAlive(id)) {
    logColorful({color: 'yellow'}, `Process ${id} is not running.`);
    return;
  }
  await stopCp(id);
  logColorful({}, `Process ${id} stopped.`);
}
