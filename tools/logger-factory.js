const path = require('path');
const loggerFactory = require('logger-factory');

const useColors = true;
const toFile = useColors ? null : path.resolve(__dirname, '../log/proxy')

loggerFactory.getState().setConfigs({
  debug: '#*',
  useColors,
  toFile,
  maxSize: 1024 * 1024 * 16,
  maxCount: 10,
});

module.exports = loggerFactory;