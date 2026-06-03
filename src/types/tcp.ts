export interface TcpGateWayOptions {
  // support string type for more compatible: parse to number if type is string
  port?: number | string;
  uploadDir?: string;
  staticDir?: string;
}
