import fs from 'fs';
import path from 'path';
import {spawn} from 'child_process';
import {findClosestFile, goOnOrNot, logColorful} from '../../modules/lib/node';

/**
 * Sequelize will throw Error: Please install sqlite3 package manually, event sqlite3 is installed.
 * /Users/wuxifei/.pyenv/versions/3.12.6/bin/python3 -m pip install --user setuptools
 */
export async function rebuildSqlite3() {
  const pkgFile = findClosestFile(process.cwd(), 'package.json');
  const projectDir = path.join(pkgFile, '..');
  if (
    !(await goOnOrNot({
      tips: [`Will you build sqlite3 for project: ${projectDir}?`],
      defaultValue: true,
    }))
  ) {
    return;
  }
  const sqlite3Dir = path.join(projectDir, 'node_modules/sqlite3');
  if (!fs.existsSync(sqlite3Dir)) {
    throw new Error(`dir not exist: ${sqlite3Dir}`);
  }
  const realpath = fs.realpathSync(sqlite3Dir);
  process.chdir(realpath);
  const command = 'node';
  const args = ['../@mapbox/node-pre-gyp/bin/node-pre-gyp', 'rebuild', '--build-from-source'];
  const wholeCommand = [command, ...args].join(' ');
  logColorful({color: 'magenta'}, `cd ${process.cwd()}`, wholeCommand);
  const childProcess = spawn(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
  await new Promise(res => {
    childProcess.on('spawn', res);
    childProcess.on('close', () => {
      logColorful({color: 'red'}, 'closed');
    });
  });
  /** do pipe after spawn success */
  childProcess.stdout.pipe(process.stdout);
  childProcess.stderr.pipe(process.stderr);
}
