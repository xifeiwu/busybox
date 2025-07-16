import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {
  GitRepoInfoTree,
  goOnOrNot,
  logColorful,
  coloringContent,
  syncUpGitRepos,
  writeGitIgnoreFile,
} from '../../modules/lib/node';

interface ConfigFileExport {
  repoInfoTree: GitRepoInfoTree;
  /** relative path  */
  repoDir: string;
}

const program = new Command();
program.name('syncup gitmodules').description('sync up git modules by config');
program
  .argument('[gitmoduleConfigFile]', 'path to ts file to run')
  .action(async (gitmoduleConfigFile: string) => {
    const cwd = process.cwd();
    const fileNames = [gitmoduleConfigFile, 'gitmodules.ts', 'gitmodules.js', 'gitmodules.json'].filter(
      Boolean
    );
    gitmoduleConfigFile = fileNames.map(p => path.resolve(cwd, p)).find(it => fs.existsSync(it));
    if (!gitmoduleConfigFile) {
      throw new Error(
        `Not found git modules config file in current work dir: ['gitmodules.ts', 'gitmodules.js', 'gitmodules.json']`
      );
    }
    const {repoInfoTree, repoDir} = require(gitmoduleConfigFile) as ConfigFileExport;
    const hostDir = cwd;
    for (const dir of [hostDir, repoDir]) {
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
        throw new Error(`dir not exist: ${dir}`);
      }
    }
    if (
      !(await goOnOrNot({
        tips: [
          'Please confirm config:',
          coloringContent({}, {configFile: gitmoduleConfigFile, hostDir, repoDir}),
        ],
        defaultValue: true,
        style: {color: 'black'},
      }))
    ) {
      return;
    }
    await syncUpGitRepos(repoInfoTree, {
      hostDir,
      repoDir,
    });
    writeGitIgnoreFile(repoInfoTree, {
      hostDir,
      repoDir,
    });
  });

program.parse(process.argv);
