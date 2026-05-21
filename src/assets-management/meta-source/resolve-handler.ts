import {getFileMetaHandler} from '../external';
import type {GetMetaHandlers, MetaHandlers} from '../external';
import type {ParsedMetaSource} from './types';
import {createDbMetaHandlersFactory} from './db-handler';

export async function createMetaHandlersFactory(source: ParsedMetaSource): Promise<GetMetaHandlers> {
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
