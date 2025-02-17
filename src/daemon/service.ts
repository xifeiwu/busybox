import {
  getSocketPath,
  logColorful,
  selectOption,
  startDetachedDaemon,
  SocketClientToDaemon,
  Daemon,
} from '@src/service/external';
import {debugServer, tlsGateway, tcpGateway} from './config';

export const cpManagerConfigMap = [debugServer, tlsGateway, tcpGateway].reduce<{
  [key: string]: Daemon.CpManagerConfig;
}>((sum, func) => {
  const config = func();
  return {
    ...sum,
    [config.id]: config,
  };
}, {});
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
  try {
    return await socketClient.ping();
  } catch (err) {
    logColorful({color: 'red'}, 'ping fail with Error message:', err.message);
  }
}
export async function info(id?: string) {
  id = await getId(id);
  logColorful({color: 'red'}, `id: ${id}`);
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
export async function restart(id?: string) {
  id = await getId(id);
  const cpManagerConfig = cpManagerConfigMap[id];
  if (!cpManagerConfig) {
    throw new Error(`cpManagerConfig is null`);
  }
  const result = await socketClient.restart(cpManagerConfigMap[id]);
  return result;
}
export async function stop(id?: string) {
  id = await getId(id);
  const result = await socketClient.stop(id);
  return result;
}
