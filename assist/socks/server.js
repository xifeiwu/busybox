var socks = require('socksv5');
const loggerFactory = require('../../tools/get-logger-factory')({
  toFile: path.resolve(__dirname, 'logs/visit.log')
});
const logger = loggerFactory('#');

const useAuth = true;
const port = 2080;

const AUTH_NO = false;
const AUTH_USERNAME_PASSWORD = true;

const socksServer = socks.createServer({
  auths: (AUTH_USERNAME_PASSWORD ? [socks.auth.UserPassword((username, password, cb) => {
    // console.log(username, password);
    // console.log(username == 'wxf' && password == 'wxf');
    cb(username == 'wxf' && password == 'wxf');
  })] : []).concat(AUTH_NO ? [socks.auth.None()] : [])

}).listen(port);

socksServer.on('listening', () => {
  console.log(`listening on port ${port}`);
});

socksServer.on('connection', (reqInfo, accept, deny) => {
  logger(`${reqInfo.dstAddr}:${reqInfo.dstPort}`);
  accept();
})


// auths列表中的顺序代表验证偏好
// auths: [socks.auth.UserPassword('wxf', 'wxf'), socks.auth.None()]