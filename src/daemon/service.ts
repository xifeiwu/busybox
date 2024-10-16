import {
  getSocketPath,
  logColorful,
  selectOption,
  startDetachedDaemon,
  SocketClientToDaemon,
} from '@src/service/external';
import {cpManagerConfigMap} from './config';

const daemonId = 'busybox-daemon';
const daemonSocketPath = getSocketPath(daemonId);
const socketClient = new SocketClientToDaemon({path: daemonSocketPath});
const idList = [...Object.values(cpManagerConfigMap).map(it => it.id), daemonId];

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

export async function runDetachedDaemon() {
  const spawnResponse = await startDetachedDaemon(
    {
      id: daemonId,
    },
    {debug: false}
  );
  logColorful({}, spawnResponse);
}

export async function ping() {
  return await socketClient.ping();
}
export async function info(id?: string) {
  id = await getId(id);
  console.log(`id`);
  console.log(id);
  const result = await socketClient.info(id);
  return result;
}
export async function start(id?: string) {
  id = await getId(id);
  if (id === daemonId) {
    return await runDetachedDaemon();
  } else {
    const result = await socketClient.start(cpManagerConfigMap[id]);
    return result;
  }
}
export async function stop(id?: string) {
  id = await getId(id);
  const result = await socketClient.stop(id);
  return result;
}
