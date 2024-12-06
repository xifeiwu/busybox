import {TcpGateWayConfig} from '@src/service/external';
import {Env} from '@src/types';
import {elifTcpGateWayConfig} from './elif';
import {localTcpGateWayConfig} from './local';

export const tcpGatewayConfigByEnv: {
  [env in Env]: TcpGateWayConfig;
} = {
  local: localTcpGateWayConfig,
  elif: elifTcpGateWayConfig,
};
