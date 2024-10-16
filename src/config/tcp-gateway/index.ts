import { TcpGateWayConfig } from '@src/service/external';
import {Env} from '@src/types';
import {elifTcpGateWayConfig} from '@src/config/tcp-gateway/elif';
import {localTcpGateWayConfig} from '@src/config/tcp-gateway/local';

export const tcpGatewayConfigByEnv: {
  [env in Env]: TcpGateWayConfig;
} = {
  local: localTcpGateWayConfig,
  elif: elifTcpGateWayConfig,
};
