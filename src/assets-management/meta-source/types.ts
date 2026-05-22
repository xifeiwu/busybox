export type MetaSourceKind = 'local' | 'sqlite' | 'mysql';

/** Sequelize connection options (aligned with sequelize-typescript SequelizeOptions). */
export type SequelizeConfig = {
  dialect: string;
  storage?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  [key: string]: unknown;
};

export type ParsedMetaSource =
  | {kind: 'local'; key: string; metaFilePath: string; priority: number}
  | {kind: 'sqlite'; key: string; config: SequelizeConfig; priority: number}
  | {kind: 'mysql'; key: string; config: SequelizeConfig; priority: number};

/** Export shape for sqlite/mysql meta source files. */
export interface DbMetaSourceFileExport {
  config: SequelizeConfig;
  priority?: number;
}

/** Commander subcommand options (camelCase keys from .option()). */
export type AssetsMetaCliOptions = {meta?: string};
export type AssetsRunDirectlyCliOptions = {runDirectly?: boolean};
export type AssetsMetaRunDirectlyCliOptions = AssetsMetaCliOptions & AssetsRunDirectlyCliOptions;
export type AssetsEmptyCliOptions = Record<string, never>;

/** Internal / registry options (includes global --dir). */
export interface AssetsCommandOptions {
  /** Starting directory for assets root discovery (see findAssetsRootDir). */
  dir?: string;
  meta?: string;
  runDirectly?: boolean;
}
