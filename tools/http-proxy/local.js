const CommonProxy = require('./libs/common-proxy.js');

class Proxy extends CommonProxy {
  constructor() {
    super('localhost');
  }

  'to:10.10.202.143:30334'() {
    const proxyOptions = {
      target: 'http://10.10.202.143:30334',
      changeOrigin: true
    }
    this.startProxyServer(proxyOptions, 30334);
  }

  start() {
    this['to:10.10.202.143:30334']()
    // this['to:172.31.160.103:6001']()
  }
}

new Proxy().start();
