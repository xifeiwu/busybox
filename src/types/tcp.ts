import {Env} from '../service/external';
export interface TcpGateWayOptions {
  env?: Env;
  port?: number;
  uploadDir?: string;
  staticDir?: string;
}
