const path = require('path');
module.exports.config = {
  infoToCp: {
    preScript: path.join(__dirname, 'set-env.ts'),
  },
  runtimeOptions: {
    '--swc': false,
    '--transpileOnly': true,
  },
};
