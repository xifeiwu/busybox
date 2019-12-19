const dns = require('dns');
const net = require('net');
const constants = require('./constants');
const utils = require('./utils');
const loggerFactory = require('../logger-factory');
const proxyLogger = loggerFactory('#socks_proxy');
const clientLogger = loggerFactory('#client');
const serverLogger = loggerFactory('#server');


class SocksServer {
  constructor(socket) {
    this._socket = socket;
    this.status = constants.STATUS.CONNECTED,
    this.state = {
      greeting: [],
      auth: [],
      requestDetail: {
        origin: null,
        size: 0,
        command: null,
        addressType: null,
        address: null,
        port: null,
      }
    }
  }

  _closeSocket(reason) {
    serverLogger(constants.ERRORS.InvalidSocksVersion);
    serverLogger(this.state);
    if (this._socket) {
      this._socket.destroy();
      this._socket = null;
    }
  }

  async _onData(socket, resolve, reject, data) {
    const STATUS = constants.STATUS;
    const timeoutTag = setTimeout(() => {
      reject(new Error('timeout'));
    }, 6000);
    try {
      switch (this.status) {
        case STATUS.CONNECTED:
          this._handleGreeting(data, socket);
          break;
         case STATUS.GREETING_END:
           await this._handleRequestDetail(data, socket, resolve, reject);
          break;
        case STATUS.REQUEST_DETAIL_END:
          // console.log(data.toString());
          this.state.requestDetail.size += data.length;
          this.status = constants.STATUS.END;
          break;
      }
    } catch (err) {
      reject(err);
    } finally {
      clearTimeout(timeoutTag);
    }
  }

  _handleGreeting(data, socket) {
    this.status = constants.STATUS.GREETING_START;
    const version = data[0];
    // console.log(data);
    if (version !== 0x05) {
      throw new Error(constants.ERRORS.InvalidSocksVersion);
    }

    const responseBytes = [version, constants.SOCKS5_AUTH.NoAuth];

    socket.write(Buffer.from(responseBytes));

    this.status = constants.STATUS.GREETING_END;
  }

  async _handleRequestDetail(data, socket, resolve, reject) {
    this.status = constants.STATUS.REQUEST_DETAIL_START;

    const version = data[0];
    if (version !== 0x05) {
      throw new Error(constants.ERRORS.InvalidSocksVersion);
    }

    const addressType = data[3];
    var adddressBytes, portBytes;

    var addressLength = 0;
    if (addressType === constants.ATYP.DOMAIN_NAME) {
      addressLength = data[4];
      adddressBytes = data.slice(5, 5 + addressLength);
      // dns.lookup(req.dstAddr, function(err, dstIP) {});
      portBytes = [data[5 + addressLength], data[5 + addressLength + 1]];
    } else if (addressType === constants.ATYP.IPv4) {
      addressLength = 4;
      adddressBytes = [data[4], data[5], data[6], data[7]];
      portBytes = [data[8], data[9]];
    } else if (addressType === constants.ATYP.IPv6) {
      addressLength = 16;
      adddressBytes = data.slice(4, 4 + addressLength);
      portBytes = data.slice(4 + addressLength, 4 + addressLength + 2);
    }

    const requestDetail = this.state.requestDetail;
    requestDetail.origin = data;
    requestDetail.command = data[1];
    requestDetail.addressType = data[3];

    if (this._atyp === constants.ATYP.IPv4)
      requestDetail.address = Array.prototype.join.call(adddressBytes, '.');
    else if (this._atyp === constants.ATYP.IPv6) {
      var ipv6str = '';
      for (var b = 0; b < 16; ++b) {
        if (b % 2 === 0 && b > 0)
          ipv6str += ':';
        ipv6str += (adddressBytes[b] < 16 ? '0' : '') + adddressBytes[b].toString(16);
      }
      requestDetail.address = ipv6str;
    } else {
      requestDetail.address = adddressBytes.toString();
    }
    requestDetail.port = (portBytes[0] << 8) + portBytes[1];

    if (utils.proxy(this.state.requestDetail)) {
      this.status = constants.STATUS.REQUEST_DETAIL_END;
      resolve({
        socket,
        state: this.state
      });
    } else {
      // handle socks connect by local
      await this._proxySocket(socket, resolve, reject);
    }
  }

  async _proxySocket(socket, resolve, reject) {
    const requestDetail = this.state.requestDetail;
    const targetIP = await new Promise((resolve, reject) => {
      dns.lookup(requestDetail.address, function(err, ip) {
        if (err) {
          reject(err);
        } else {
          resolve(ip);
        }
      });
    });
    var dstSock = new net.Socket();
    dstSock.setKeepAlive(false);
    dstSock.on('error', err => reject(err)).on('connect', () => {
      if (socket.writable) {
        var localbytes = utils.ipbytes(dstSock.localAddress || '127.0.0.1'),
            len = localbytes.length,
            bufrep = new Buffer(6 + len),
            p = 4;
        bufrep[0] = 0x05;
        bufrep[1] = constants.REPLY.SUCCESS;
        bufrep[2] = 0x00;
        bufrep[3] = (len === 4 ? constants.ATYP.IPv4 : constants.ATYP.IPv6);
        for (var i = 0; i < len; ++i, ++p)
          bufrep[p] = localbytes[i];
        bufrep.writeUInt16BE(dstSock.localPort, p, true);

        socket.write(bufrep);
        socket.pipe(dstSock).pipe(socket);
        socket.resume();
        resolve({});
        this.status = constants.STATUS.REQUEST_DETAIL_END;
      } else if (dstSock.writable) {
        dstSock.end();
      }
    }).connect(requestDetail.port, targetIP);
  }

  parse(socket) {
    return new Promise((resolve, reject) => {
      // NOTICE: off event 'data' when parse is finished
      socket.on('data', this._onData.bind(this, socket, resolve, reject));
      socket.once('error', err => {
        reject(err);
      });
      socket.once('close', err => {
        const requestDetail = this.state.requestDetail;
        serverLogger(`${requestDetail.address}:${requestDetail.port}(${requestDetail.size}) (incoming)closed`);
      });
    });
  }
}

class SocksClient {
  constructor(state) {
    this.inComeingState = state;
    this.status = constants.STATUS.CONNECTING;
  }

  _sendGreeting(socket, options) {
    const methods = (options.username && options.password) ? [constants.SOCKS5_AUTH.NoAuth, constants.SOCKS5_AUTH.UserPass] : [constants.SOCKS5_AUTH.NoAuth]
    // clientLogger(Buffer.from([0x05, methods.length].concat(methods)));
    socket.write(Buffer.from([0x05, methods.length].concat(methods)));
    this.status = constants.STATUS.GREETING_START;
  }

  _sendAuth(socket, options) {
    const {username, password} = options;
    var usernameLength = Buffer.byteLength(username);
    var passwordLength = Buffer.byteLength(password);
    if (usernameLength > 255 || passwordLength > 255) {
      throw new Error(constants.ERRORS.MORE_THAN_255_BYTES);
    }
    var buf = new Buffer(3 + usernameLength + passwordLength);
    buf[0] = 0x01;
    buf[1] = usernameLength;
    buf.write(username, 2, usernameLength);
    buf[2 + usernameLength] = passwordLength;
    buf.write(password, 3 + usernameLength, passwordLength);
    socket.write(buf);
    this.status = constants.STATUS.AUTH_START;
  }

  _sendRequestDetail(socket, resolve, reject) {
    this.status = constants.STATUS.REQUEST_DETAIL_START;
    socket.write(this.inComeingState.requestDetail.origin);
    socket.pause();
    resolve({
      socket
    })
  }

  async _onData(options, socket, resolve, reject, data) {
    const STATUS = constants.STATUS;
    const timeoutTag = setTimeout(() => {
      reject(new Error('timeout'));
    }, 6000);
    try {
      // clientLogger(this.STATUS);
      // clientLogger(data);
      switch (this.status) {
        case STATUS.GREETING_START:
          const version = data[0];
          if (version !== 0x05) {
            reject(constants.ERRORS.InvalidSocksVersion);
            return;
          }
          this.status = STATUS.GREETING_END;
          if (data[1] === constants.SOCKS5_AUTH.NoAuth) {
            this._sendRequestDetail(socket, resolve, reject);
          } else if (data[1] === constants.SOCKS5_AUTH.UserPass) {
            this._sendAuth(socket, options)
          } else {
            reject(constants.ERRORS.INVALID_METHOD);
            return;
          }
          break;
        case STATUS.AUTH_START:
          if (data[0] != 0x01 || data[1] != 0x00) {
            reject(constants.ERRORS.CLIENT_AUTH_FAIL);
            return;
          }
          this.status = STATUS.AUTH_END;
          this._sendRequestDetail(socket, resolve, reject);
          break;
         case STATUS.REQUEST_DETAIL_START:
          break;
      }
    } catch (err) {
      reject(err)
    }
    clearTimeout(timeoutTag);
  }

  connect(options) {
    const proxy = Object.assign({
      host: '127.0.0.1',
      port: 1080,
      username: '',
      password: ''
    }, options);

    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      socket.on('connect', () => {
        this.status = constants.STATUS.CONNECTED;
        this._sendGreeting(socket, options);
      });
      socket.on('data', this._onData.bind(this, options, socket, resolve, reject))
      socket.once('error', function(err) {
        clientLogger('client Error');
        clientLogger(err);
      }).once('close', function(had_err) {
        // clientLogger('client Closed');
      });
      socket.connect({
        host: proxy.host,
        port: proxy.port
      })
    });

  }
}


module.exports = class SocksProxy {
  constructor() {
    this._connections = 0;
  }

  _initState() {
    const state = {
      data: {
        greeting: [],
        auth: [],
        requestDetail: []
      },
      incoming: {
        status: constants.STATUS.CONNECTED,
      },
      outgoing: {
        status: constants.STATUS.CONNECTING,
      }
    }
    return state;
  }

  start(port) {
    this._srv = new net.Server((socket) => {
      const state = this._initState();
      // if (this._connections >= this.maxConnections) {
      //   socket.destroy();
      //   return;
      // }
      ++this._connections;
      socket.once('close', function(had_err) {
        --this._connections;
      });
      this._onConnection(socket);
    }).on('error', function(err) {
      proxyLogger('onError');
      proxyLogger(err);
    }).on('listening', function() {
      proxyLogger(`started: 127.0.0.1:${port}`);
    }).on('close', function() {
    }).listen(port, '127.0.0.1');
  }

  async _onConnection(socket, state) {
    try {
      const incoming = await (new SocksServer()).parse(socket);
      if (incoming.socket) {
        // proxyLogger(incoming.state.requestDetail);
        const outgoing = await (new SocksClient(incoming.state)).connect(utils.proxy(incoming.state.requestDetail));
        // proxyLogger(outgoing);
        incoming.socket.pipe(outgoing.socket).pipe(incoming.socket);
        outgoing.socket.resume();
      }
    } catch (err) {
      proxyLogger(err);
    }
  }

}
