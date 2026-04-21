import {
  isManagedProcPidAlive,
  listProcKeyInfo,
  readProcInfo,
  startProcess,
  killProc,
  restartProcess,
  removeProcBaseDir,
  tailProcessOutLog,
  getProcKeyInfo,
  StartProcOptions,
  ListProcKeyInfoOptions,
} from '../../modules/lib/node/lib/process-manager';
import {goOnOrNot, selectOption} from '../../modules/lib/node/readline';
import {selectConfigById} from '../2-process';

type SelectManagedProcOptions = {id?: string} & ListProcKeyInfoOptions;

function emptyListMessage(filter?: ListProcKeyInfoOptions['filter']): string {
  if (filter === 'running') {
    return 'No running managed processes found.';
  }
  if (filter === 'dead') {
    return 'No stopped (dead) managed processes found.';
  }
  return 'No managed processes found (empty process-manager root or no matching entries).';
}

function missingIdMessage(id: string, filter?: ListProcKeyInfoOptions['filter']): string {
  if (filter === 'running') {
    return `Process "${id}" is not running or does not exist.`;
  }
  if (filter === 'dead') {
    return `Process "${id}" is still running or does not exist.`;
  }
  return `No managed process "${id}" (or its info file is missing).`;
}

async function selectManagedProcPid(options: SelectManagedProcOptions): Promise<string> {
  const {id, ...listOpts} = options;
  const rows = await list(listOpts);
  const ids = rows.flatMap(row => (row ? [row.key] : []));
  if (id) {
    if (ids.includes(id)) {
      return id;
    }
    throw new Error(missingIdMessage(id, listOpts.filter));
  }
  if (ids.length === 0) {
    throw new Error(emptyListMessage(listOpts.filter));
  }
  const selected = await selectOption(ids.map(x => ({label: x, id: x})));
  return selected.id;
}

export async function list(options?: ListProcKeyInfoOptions) {
  return await listProcKeyInfo(options);
}

export async function info(id?: string) {
  const cpId = await selectManagedProcPid({id});
  const info = await getProcKeyInfo(cpId);
  if (!info) {
    throw new Error(`No info file for process: ${cpId}`);
  }
  return {cpId, info};
}

export async function detail(id?: string) {
  const cpId = await selectManagedProcPid({id});
  return {cpId, info: readProcInfo(cpId)};
}

export async function start(id?: string, options?: StartProcOptions) {
  const config = await selectConfigById(id);
  if (isManagedProcPidAlive(config.id)) {
    const restart = await goOnOrNot({
      tips: [
        `Process "${config.id}" is already running.`,
        'Restart it (stop, then start with the same config)?',
      ],
      defaultValue: false,
    });
    if (restart) {
      return {cpId: config.id, result: await restartProcess(config, undefined, options)};
    }
    throw new Error(`Process "${config.id}" is already running, cannot start again.`);
  }

  return {cpId: config.id, result: await startProcess(config, options)};
}

export async function restart(id?: string, clean?: boolean) {
  const config = await selectConfigById(id);
  return {cpId: config.id, result: await restartProcess(config, {cleanUp: clean})};
}

export async function stop(id?: string, clean?: boolean) {
  const cpId = await selectManagedProcPid({id, filter: 'running'});
  const killedPids = await killProc(cpId, {cleanUp: clean});
  return {cpId, killedPids, cleaned: Boolean(clean)};
}

export async function log(id?: string) {
  const cpId = await selectManagedProcPid({id, filter: 'running'});
  await tailProcessOutLog(cpId);
  return {cpId};
}

export async function clean(id?: string) {
  const cpId = await selectManagedProcPid({id, filter: 'dead'});
  await removeProcBaseDir(cpId);
  return {cpId};
}
