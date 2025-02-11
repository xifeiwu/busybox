#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {goOnOrNot, logColorful, syncUpGitRepos, writeGitIgnoreFile} from '../modules/lib/node';

const program = new Command();
program.name('syncup gitmodules').description('sync up git modules by config');
program
  .argument('[jsonFile]', 'path to ts file to run')
  .option('-h, --host-dir <hostDir>', 'host dir of project')
  .option('-r, --repo-dir <repoDir>', 'the dir to locate submodules')
  .action(async (jsonFilePath: string, options) => {
    const cwd = process.cwd();
    let {hostDir, repoDir} = options;
    // logColorful({}, `Params passed:`, {jsonFilePath, options});
    const fileNames = [jsonFilePath, 'gitmodules.ts', 'gitmodules.js', 'gitmodules.json'].filter(Boolean);
    jsonFilePath = fileNames.map(p => path.resolve(cwd, p)).find(it => fs.existsSync(it));
    if (!jsonFilePath) {
      throw new Error(`jsonFilePath not exist: ${jsonFilePath}`);
    }
    let repoInfo = require(jsonFilePath);
    /**
     * For the case export default in .ts file
     * module.exports = {} will not not go this case
     */
    if (repoInfo.default) {
      repoInfo = repoInfo.default;
    }
    // logColorful({}, `will use repo info`, repoInfo);
    if (!hostDir) {
      hostDir = cwd;
    }
    hostDir = path.resolve(cwd, hostDir);
    if (!fs.existsSync(hostDir) || !fs.statSync(hostDir).isDirectory()) {
      throw new Error(`hostDir not exist or is not a dir.`);
    }
    /** value of repoDir should be a relative path */
    if (!repoDir) {
      repoDir = 'vendor';
    }
    logColorful({color: 'yellow'}, `Config file will be used:`, jsonFilePath, `params for syncUpGitRepos:`, {
      hostDir,
      repoDir,
    });
    if (
      !(await goOnOrNot({
        defaultValue: true,
      }))
    ) {
      return;
    }
    await syncUpGitRepos(repoInfo, {
      hostDir,
      repoDir,
    });
    writeGitIgnoreFile(repoInfo, {
      hostDir,
      repoDir,
    });
  });

program.parse(process.argv);
