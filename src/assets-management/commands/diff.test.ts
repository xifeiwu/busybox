import {runAssetsDiffCommand} from './diff';

export async function testRunAssetsDiffCommand() {
  const rootDir =
    '/Users/xfwu/code/node/tool/busybox/modules/lib/node/lib/assets-management/test/.tmp/source';
  await runAssetsDiffCommand(rootDir, {
    meta: 'local',
  });
}
