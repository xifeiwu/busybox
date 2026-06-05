import {Env, AssistServiceConfig} from '../../service/external';
import {elifTcpGateWayConfig, tcpPort80, tcpPort443} from './elif';
import {LOCAL_ASSIST_SERVER_CONFIG, tcpPort3160} from './local';

/**
 * For config by env, some value should be constant, like tcp server config.
 */
export const ASSIST_SERVER_CONFIG_BY_ENV: {
  [env in Env]: AssistServiceConfig;
} = {
  [Env.local]: {...LOCAL_ASSIST_SERVER_CONFIG, gateway: [tcpPort3160]},
  [Env.elif]: {...elifTcpGateWayConfig, gateway: [tcpPort80, tcpPort443]},
};
