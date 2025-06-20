import {Env} from '../service/external';
export interface TcpGateWayOptions {
  env?: Env;
  // support string type for more compatible: parse to number if type is string
  port?: number | string;
  uploadDir?: string;
  staticDir?: string;
}
