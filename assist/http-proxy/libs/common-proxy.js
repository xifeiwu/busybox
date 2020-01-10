

var http = require('http'),
    net = require('net'),
    url = require('url'), 
    path = require('path'),
    util = require('util');

const httpProxy = require('node-http-proxy');
const loggerFactory = require('./logger-factory.js');

const proxy = httpProxy.createServer();

module.exports = class Proxy {
  constructor(hostName) {
    if (!hostName) {
      throw new Error(`hostName must be set`);
    }
    this.log = loggerFactory(`proxy:${hostName}`);
    proxy.on('error', err => {
      this.log(err);
    });
  }

  // log() {
  //   // console.log.apply(null, Array.prototype.slice.call(arguments))
  //   debug.apply(null, Array.prototype.slice.call(arguments));
  // }

  startProxyServer(proxyOptions, port) {
    const server = http.createServer((req, res) => {
      const start = Date.now();
      const originUrl = req.url;
      
      proxy.web(req, res, proxyOptions);

      const onfinish = done.bind(this, 'finish')
      const onclose = done.bind(this, 'close')
      res.once('finish', onfinish)
      res.once('close', onclose)
      function done (event) {
        res.removeListener('finish', onfinish)
        res.removeListener('close', onclose)
        this.log(req.method, originUrl, 'to', `${proxyOptions.target}${req.url}`, `[${Date.now() - start}ms]`)
      }
    }).listen(port);
    server.on('listening', () => {
      this.log(`proxy server started: http://127.0.0.1:${port}`);
    });
    server.on('error', err => {
      this.log(err);
    });
  }

  another_way() {
    const proxyOptions = {
      target: 'http://10.10.202.143:30334',
      changeOrigin: true
    }
    const proxyServer = httpProxy.createServer(proxyOptions).listen(30334);
    proxyServer.on('error', (err, req, res, url) => {
      this.log(err);
    });
    proxyServer.on('end', (req, res, proxyRes) => {
      this.log(req.method, req.oldPath, 'to', target + ctx.req.url, `[${duration}ms]`);
    });
  }

  start() {
    this['to:10.10.202.143:30334']()
    // this['to:172.31.160.103:6001']()
  }
}

