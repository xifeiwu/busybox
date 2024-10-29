const path = require('path');
const cp = require('child_process');
const rootDir = path.resolve(__dirname, '..');

function execAndLog(cmd) {
  console.log(cmd);
  try {
    const result = cp.execSync(cmd);
    console.log(result.toString());
    return result;
  } catch (err) {
    // console.log(err);
    if (err.stdout) {
      console.log(err.stdout.toString());
    }
  }
}

process.chdir(rootDir);
execAndLog('npm run build');

process.chdir(path.join(rootDir, 'modules/lib/node'));
execAndLog('npx tsc');
process.chdir(rootDir);
