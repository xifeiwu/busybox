import {KoaShortCutConfig} from '@modules/lib/net';

export interface ShortCutConfig {
  koa?: KoaShortCutConfig;
  gateway?: {port?: number | string};
}
