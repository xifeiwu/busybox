const dns = require('dns');
const net = require('net');
const constants = require('./constants');

class SocksServer {
  constructor(socket) {
    this._socket = socket;
    this.status = constants.STATUS.CONNECTED,
    this.state = {
      greeting: [],
      auth: [],
      requestDetail: {
        origin: null,
        command: null,
        addressType: null,
        address: null,
        port: null,
      }
    }
  }

  _closeSocket(reason) {
    console.log(constants.Errors.InvalidSocksVersion);
    console.log(this.state);
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
          this.handleGreeting(data, socket);
          break;
         case STATUS.GREETING_END:
           await this.handleRequestDetail(data, socket, resolve);
          break;
        case STATUS.REQUEST_DETAIL_END:
          break;
      }
    } catch (err) {
      reject(err);
    } finally {
      clearTimeout(timeoutTag);
    }
  }

  handleGreeting(data, socket) {
    this.status = constants.STATUS.GREETING_START;
    const version = data[0];
    if (version !== 0x05) {
      throw new Error(constants.Errors.InvalidSocksVersion);
    }

    const responseBytes = [version, constants.SOCKS5_AUTH.NoAuth];

    socket.write(Buffer.from(responseBytes));

    this.status = constants.STATUS.GREETING_END;
  }

  async handleRequestDetail(data, socket, resolve) {
    this.status = constants.STATUS.REQUEST_DETAIL_START;

    const version = data[0];
    if (version !== 0x05) {
      throw new Error(constants.Errors.InvalidSocksVersion);
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

    this.status = constants.STATUS.REQUEST_DETAIL_END;

    resolve({
      socket,
      state: this.state
    });
  }

  parse(socket) {
    return new Promise((resolve, reject) => {
      // NOTICE: off event 'data' when parse is finished
      socket.on('data', this._onData.bind(this, socket, resolve, reject));
      socket.once('error', err => {
        reject(err);
      });
      socket.once('close', err => {
        console.log('closed');
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
    const methods = (options.userName && options.passWord) ? [constants.SOCKS5_AUTH.NoAuth, constants.SOCKS5_AUTH.UserPass] : [constants.SOCKS5_AUTH.NoAuth]
    // console.log(Buffer.from([0x05, methods.length].concat(methods)));
    socket.write(Buffer.from([0x05, methods.length].concat(methods)));
    this.status = constants.STATUS.GREETING_START;
  }

  _sendAuth(socket, options) {
    const {userName, passWord} = options;
    userNameLength = Buffer.byteLength(userName);
    passWordLength = Buffer.byteLength(passWord);
    if (userNameLength > 255 || passWordLength > 255) {
      throw new Error(constants.ERRORS.MORE_THAN_255_BYTES);
    }
    var buf = new Buffer(3 + userNameLength + passWordLength);
    buf[0] = 0x01;
    buf[1] = userNameLength;
    buf.write(user, 2, userNameLength);
    buf[2 + userNameLength] = passWordLength;
    buf.write(pass, 3 + userNameLength, passWordLength);
    socket.write(socket);
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
      // console.log(this.STATUS);
      // console.log(data);
      switch (this.status) {
        case STATUS.GREETING_START:
          const version = data[0];
          if (version !== 0x05) {
            reject(constants.Errors.InvalidSocksVersion);
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
          if (data[0] != 0x05 || data[1] != 0x00) {
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
      userName: '',
      passWord: ''
    }, options);

    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      socket.on('connect', () => {
        this.status = constants.STATUS.CONNECTED;
        this._sendGreeting(socket, options);
      });
      socket.on('data', this._onData.bind(this, options, socket, resolve, reject))
      socket.once('error', function(err) {
        console.log('client Error');
        console.log(err);
      }).once('close', function(had_err) {
        // console.log('client Closed');
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
      console.log('onError');
      console.log(err);
    }).on('listening', function() {
      console.log(`started: 127.0.0.1:${port}`);
    }).on('close', function() {

    }).listen(port, '127.0.0.1');
  }

  proxyConfig(requestDetail) {
    const {address, port} = requestDetail;
    const proxyMap = {
      elif: {
        host: 'elif.site',
        port: 2003
      },
      local: {
        host: '127.0.0.1',
        port: 3008
      }
    }
    const filter = {
      elif: [/google/]
    }
    var target = 'local'
    for (let key in filter) {
      if (filter[key].find(it => it.test(address))) {
        target = 'elif';
        break;
      }
    }
    console.log(`${address}:${port} ${target}`);
    return proxyMap[target];
  }

  async _onConnection(socket, state) {
    try {
      const incoming = await (new SocksServer()).parse(socket);
      // console.log(incoming.state.requestDetail);
      const outgoing = await (new SocksClient(incoming.state)).connect(this.proxyConfig(incoming.state.requestDetail));
      // console.log(outgoing);
      incoming.socket.pipe(outgoing.socket).pipe(incoming.socket);
      outgoing.socket.resume();
    } catch (err) {
      console.log(err);
    }
  }

}