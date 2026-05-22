import type {MetaHandlers} from '../external';
import {getMetaHandlersByKey, getPrimaryMetaHandlers, selectMetaSourceHandlers} from './registry';
import type {MetaSourceRegistry} from './registry';
import {AssetsCommandOptions} from './types';

export async function resolveMetaHandlers(
  registry: MetaSourceRegistry,
  options?: AssetsCommandOptions & {selectTips?: string[]; allowSelect?: boolean}
): Promise<MetaHandlers> {
  if (options?.meta) {
    return getMetaHandlersByKey(registry, options.meta);
  }
  if (options?.allowSelect && registry.entries.length > 1) {
    const {handlers} = await selectMetaSourceHandlers(registry, {tips: options.selectTips});
    return handlers;
  }
  return getPrimaryMetaHandlers(registry);
}
