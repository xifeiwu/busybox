var socks = require('socksv5');

const socksServerport = 2080;

const AUTH_NO = true;
const AUTH_USERNAME_PASSWORD = false;

var client = socks.connect({
  // host: 'baidu.com',
  host: 'nodejs.cn',
  port: 80,
  proxyHost: '127.0.0.1',
  proxyPort: socksServerport,
  // auths: [ socks.auth.None() ],
  auths: (AUTH_USERNAME_PASSWORD ? [socks.auth.UserPassword('wxf', 'wxf')] : []).concat(AUTH_NO ? [socks.auth.None()]: []),
}, function(socket) {
  if (socket instanceof Error) {
    console.log('Error');
    console.log(socket);
    return;
  }
  console.log('>> Connection successful');
  socket.write('GET /node.js/rules HTTP/1.0\r\n\r\n');
  socket.pipe(process.stdout);
});
