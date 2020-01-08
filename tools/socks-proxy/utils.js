const net = require('net');
const ipv6 = require('ipv6').v6;
const proxyConfig = require('./config.js');
const loggerFactory = require('../logger-factory');
const proxyLogger = loggerFactory('#utils.proxy');

exports.ipbytes = function(str) {
  var type = net.isIP(str),
      nums,
      bytes,
      i;

  if (type === 4) {
    nums = str.split('.', 4);
    bytes = new Array(4);
    for (i = 0; i < 4; ++i) {
      if (isNaN(bytes[i] = +nums[i]))
        throw new Error('Error parsing IP: ' + str);
    }
  } else if (type === 6) {
    var addr = new ipv6.Address(str),
        b = 0,
        group;
    if (!addr.valid)
      throw new Error('Error parsing IP: ' + str);
    nums = addr.parsedAddress;
    bytes = new Array(16);
    for (i = 0; i < 8; ++i, b += 2) {
      group = parseInt(nums[i], 16);
      bytes[b] = group >>> 8;
      bytes[b + 1] = group & 0xFF;
    }
  }

  return bytes;
};


exports.proxy = function({address, port}) {
  var target = 'local';
  for (let key in proxyConfig) {
    if (key === 'local') {
      continue;
    }
    if (Array.isArray(proxyConfig[key].matchs) && proxyConfig[key].matchs.find(it => it.test(address))) {
      target = key;
      break;
    }
  }
  proxyLogger(`${address}:${port} ${target}`);
  return proxyConfig[target];
}