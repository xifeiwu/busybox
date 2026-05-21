import type {GetMetaHandlers} from '../external';
import type {SequelizeConfig} from './types';

export async function createDbMetaHandlersFactory(config: SequelizeConfig): Promise<GetMetaHandlers> {
  const {getInstance} = await import('../../../modules/lib/db/service/instance');
  const {models} = await import('../../../modules/lib/db/assets/models');
  const {getDbMetaHandler} = await import('../../../modules/lib/db/assets/meta-handler');
  const {Asset, AssetFolder} = await import('../../../modules/lib/db/assets/models');
  const sequelize = getInstance(config as Parameters<typeof getInstance>[0], {models});
  return getDbMetaHandler({Asset, Folder: AssetFolder, sequelize});
}
