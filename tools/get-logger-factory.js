module.exports = getLoggerFactory({
  debug = '#*',
  useColors = true,
  toFile = null,
  maxSize = 1024 * 1024 * 16,
  maxCount = 10,
}) {
  const loggerFactory = require('logger-factory');
  const useColors = toFile ? false : true;
  loggerFactory.getState().setConfigs({
    debug,
    useColors,
    toFile,
    maxSize,
    maxCount,
  });
  return loggerFactory;
}