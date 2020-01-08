const CommonProxy = require('./libs/common-proxy.js');

class Proxy extends CommonProxy {
  constructor() {
    super('172_31_160_87');
  }

  'to:galaxy_production'() {
    const proxyOptions = {
      target: 'http://galaxy-web-server.galaxy.production',
      changeOrigin: true
    }
    this.startProxyServer(proxyOptions, 30334);
  }

  start() {
    this['to:galaxy_production']()
  }
}

new Proxy().start();
