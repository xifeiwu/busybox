/**
GREETING:
+----+----------+----------+
|VER | NMETHODS | METHODS  |
+----+----------+----------+
| 1  |    1     | 1 to 255 |
+----+----------+----------+


*/

const STATUS = {
  CONNECTING: 1,
  CONNECTED: 2,
  GREETING_START: 3,
  GREETING_END: 4,
  AUTH_START: 5,
  AUTH_END: 7,
  REQUEST_DETAIL_START: 8,
  REQUEST_DETAIL_END: 8,
  END: 9
};

const SOCKS5_AUTH = {
  NoAuth: 0x00,
  GSSApi: 0x01,
  UserPass: 0x02
}
const CMD = {
  CONNECT: 0x01,
  BIND: 0x02,
  UDP: 0x03
};
const ATYP = {
  IPv4: 0x01,
  DOMAIN_NAME: 0x03,
  IPv6: 0x04
};

const REPLY = {
  SUCCESS: 0x00,
  GENFAIL: 0x01,
  DISALLOW: 0x02,
  NETUNREACH: 0x03,
  HOSTUNREACH: 0x04,
  CONNREFUSED: 0x05,
  TTLEXPIRED: 0x06,
  CMDUNSUPP: 0x07,
  ATYPUNSUPP: 0x08
};

const ERRORS = {
  InvalidSocksVersion: 'only socks version 5 supported',
  IPv6NotSupported: 'ipv6 not supported',
  MORE_THAN_255_BYTES: 'size too long (limited to 255 bytes)',
  CLIENT_AUTH_FAIL: 'userName/password not correct',
  INVALID_METHOD: 'method is invalid(NO_AUTH or USERNAME/PASSWORD)',
  InvalidSocksCommand: 'An invalid SOCKS command was provided. Valid options are connect, bind, and associate.',
  InvalidSocksCommandForOperation: 'An invalid SOCKS command was provided. Only a subset of commands are supported for this operation.',
  InvalidSocksClientOptionsDestination: 'An invalid destination host was provided.',
  InvalidSocksClientOptionsExistingSocket: 'An invalid existing socket was provided. This should be an instance of stream.Duplex.',
  InvalidSocksClientOptionsProxy: 'Invalid SOCKS proxy details were provided.',
  InvalidSocksClientOptionsTimeout: 'An invalid timeout value was provided. Please enter a value above 0 (in ms).',
  InvalidSocksClientOptionsProxiesLength: 'At least two socks proxies must be provided for chaining.',
  NegotiationError: 'Negotiation error',
  SocketClosed: 'Socket closed',
  ProxyConnectionTimedOut: 'Proxy connection timed out',
  InternalError: 'SocksClient internal error (this should not happen)',
  InvalidSocks4HandshakeResponse: 'Received invalid Socks4 handshake response',
  InvalidSocks5InitialHandshakeResponse: 'Received invalid Socks5 initial handshake response',
  InvalidSocks5IntiailHandshakeSocksVersion: 'Received invalid Socks5 initial handshake (invalid socks version)',
  InvalidSocks5InitialHandshakeNoAcceptedAuthType: 'Received invalid Socks5 initial handshake (no accepted authentication type)',
  InvalidSocks5InitialHandshakeUnknownAuthType: 'Received invalid Socks5 initial handshake (unknown authentication type)',
  Socks5AuthenticationFailed: 'Socks5 Authentication failed',
  InvalidSocks5FinalHandshake: 'Received invalid Socks5 final handshake response',
  InvalidSocks5FinalHandshakeRejected: 'Socks5 proxy rejected connection',
  InvalidSocks5IncomingConnectionResponse: 'Received invalid Socks5 incoming connection response',
  Socks5ProxyRejectedIncomingBoundConnection: 'Socks5 Proxy rejected incoming bound connection',
};

module.exports = {
  STATUS,
  REPLY,
  SOCKS5_AUTH,
  ATYP,
  CMD,
  ERRORS
}