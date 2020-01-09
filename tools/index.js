const fs = require('fs');
const path = require('path');
const net = require('net');
const NodeUtils = require('../utils/node');

module.exports = class Tools extends NodeUtils {
  getRootCA() {
    const caPath = path.resolve(__dirname, '../tools/commands/ssl-keys/rootCA.crt');
    return fs.readFileSync(caPath);
  }
  getCrt(domain) {
    const crtPath = path.resolve(__dirname, `../tools/commands/ssl-keys/${domain}.crt`);
    try {
      fs.statSync(crtPath)
    } catch (err) {
      console.log(err);
      return err
    }
    return fs.readFileSync(crtPath);
  }
  getKeyPem(domain) {
    const keyPath = path.resolve(__dirname, `../tools/commands/ssl-keys/${domain}.key.pem`);
    try {
      fs.statSync(keyPath)
    } catch (err) {
      console.log(err);
      return err
    }
    return fs.readFileSync(keyPath);
  }

  error({code, content, msg}) {
    const status = {
      success: false,
      code: code ? code : 0,
      msg: msg ? msg : '',
      content: content ? content : '',
      t: new Date().getTime()
    };
    return JSON.stringify(status);
  }
  success({code, content, msg}) {
    const status = {
      success: true,
      code: code ? code : 0,
      msg: msg ? msg : '',
      content: content ? content : '',
      t: new Date().getTime()
    };
    return JSON.stringify(status);
  }

  parseArgv4Class(ClassName) {
    const functionList = Object.getOwnPropertyNames(ClassName.prototype).filter(it => !it.startsWith('_'))

    if (process.argv.length === 2) {
      console.log(functionList);
    } else {
      const obj = new ClassName();
      const funcName = process.argv[2];
      if (functionList.includes(funcName)) {
        const result = obj[funcName](...process.argv.slice(3));
        console.log(result);
      } else {
        console.log(`function ${funcName} not exist`);
      }
    }
  }
}