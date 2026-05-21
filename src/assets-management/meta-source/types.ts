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

/** Export shape for local meta source files (file is the meta store). */
export interface LocalMetaSourceFileExport {
  meta: unknown;
  priority?: number;
}
