import {Env, TcpGateWayConfig} from '@src/service/external';
import {elifTcpGateWayConfig} from './elif';
import {localTcpGateWayConfig} from './local';

export const tcpGatewayConfigByEnv: {
  [env in Env]: TcpGateWayConfig;
} = {
  [Env.local]: localTcpGateWayConfig,
  [Env.elif]: elifTcpGateWayConfig,
};
