export type Env = 'local' | 'elif';
export interface TcpGateWayOptions {
  env?: Env;
  port?: number;
  uploadDir?: string;
  staticDir?: string;
}
