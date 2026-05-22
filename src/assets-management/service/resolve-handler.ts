import {getFileMetaHandler} from '../external';
import type {GetMetaHandlers, MetaHandlers} from '../external';
import type {ParsedMetaSource, SequelizeConfig} from './types';

export async function createDbMetaHandlersFactory(config: SequelizeConfig): Promise<GetMetaHandlers> {
  const {getInstance} = await import('../../../modules/lib/db/service/instance');
  const {models} = await import('../../../modules/lib/db/assets/models');
  const {getDbMetaHandler} = await import('../../../modules/lib/db/assets/meta-handler');
  const {Asset, AssetFolder} = await import('../../../modules/lib/db/assets/models');
  const sequelize = getInstance(config as Parameters<typeof getInstance>[0], {models});
  return getDbMetaHandler({Asset, Folder: AssetFolder, sequelize});
}

async function createMetaHandlersFactory(source: ParsedMetaSource): Promise<GetMetaHandlers> {
  if (source.kind === 'local') {
    if (source.metaFilePath) {
      return getFileMetaHandler({metaFile: source.metaFilePath});
    }
    return getFileMetaHandler();
  }
  return createDbMetaHandlersFactory(source.config);
}

export async function getMetaHandlersForSource(
  source: ParsedMetaSource,
  assetsDir: string
): Promise<MetaHandlers> {
  const factory = await createMetaHandlersFactory(source);
  return factory(assetsDir);
}
