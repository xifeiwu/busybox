/**
 * install redis on local before run this script: brew install redis
 */
import {logColorful, makeSureDirExist} from '@modules/lib/node';
import {exec, execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
const redisServerBin = `/opt/homebrew/opt/redis/bin/redis-server`;
const redisSentinelBin = `/opt/homebrew/opt/redis/bin/redis-sentinel`;

const configDir = path.resolve(__dirname, 'config');
const dataDir = path.resolve(__dirname, 'data');

function getRedisMasterConfig() {
  return `port 6379
dir ${dataDir}
protected-mode no
`;
}
function getRedisReplicaConfig() {
  return `port 6380
dir ${dataDir}
replicaof 127.0.0.1 6379
protected-mode no`;
}

function getSentinelConfig(port) {
  return `port ${port}
dir ${dataDir}
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 10000
sentinel parallel-syncs mymaster 1
`;
}
function getFullConfigPath(name: string) {
  return path.resolve(configDir, name);
}
type Site = 'redisMaster' | 'redisReplica' | 'sentinel26379' | 'sentinel26380' | 'sentinel26381';
function prepareConfig() {
  makeSureDirExist(configDir, {isDir: true});
  makeSureDirExist(dataDir, {isDir: true});
  const pathToConfigFile: {
    [key in Site]: {
      name: string;
      content: string;
    };
  } = {
    redisMaster: {name: 'redis-master.conf', content: getRedisMasterConfig()},
    redisReplica: {name: 'redis-replica.conf', content: getRedisReplicaConfig()},
    sentinel26379: {
      name: `sentinel26379.conf`,
      content: getSentinelConfig(26379),
    },
    sentinel26380: {
      name: `sentinel26380.conf`,
      content: getSentinelConfig(26380),
    },
    sentinel26381: {
      name: `sentinel26381.conf`,
      content: getSentinelConfig(26381),
    },
  };
  const result = Object.entries(pathToConfigFile).reduce<{[key in Site]: string}>((sum, [key, props]) => {
    const {name, content} = props;
    const fullPath = path.resolve(configDir, getFullConfigPath(name));
    fs.writeFileSync(fullPath, content);
    return {
      ...sum,
      [key]: fullPath,
    };
  }, {} as {[key in Site]: string});
  return result;
}

function logCmdAndExec(command: string) {
  logColorful({color: 'red'}, command);
  return exec(command);
}
export async function start() {
  const configFile = prepareConfig();
  const masterServer = logCmdAndExec([redisServerBin, configFile['redisMaster']].join(' '));
  const replicaServer = logCmdAndExec([redisServerBin, configFile['redisReplica']].join(' '));
  const sentinel26379 = logCmdAndExec([redisSentinelBin, configFile['sentinel26379']].join(' '));
  const sentinel26380 = logCmdAndExec([redisSentinelBin, configFile['sentinel26380']].join(' '));
  const sentinel26381 = logCmdAndExec([redisSentinelBin, configFile['sentinel26381']].join(' '));
  for (const cp of [masterServer, replicaServer, sentinel26379, sentinel26380, sentinel26381]) {
    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stderr);
  }
}
