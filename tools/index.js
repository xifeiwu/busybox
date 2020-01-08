const fs = require('fs');
const path = require('path');
const net = require('net');
const NodeUtils = require('../utils/node');

module.exports = class Tools extends NodeUtils {
  async showRequestProcess(config = {}) {
    config = this.deepMerge({
      path: '/',
      method: 'get',
      headers: {
        accept: '*/*'
      }
    }, config);

    const axios = require('axios');
    const net = new axios.Helper({
      headers: {
        common: {
          tag: 'utils.node.showRequestProcess'
        }
      }
    });
    var axiosResponse = null;
    try {
      axiosResponse = await net.requestAxiosResponse(config);
    } catch(err) {
      if (err.isAxiosError) {
        axiosResponse = err.response;
        if (!axiosResponse) {
          console.log(err);
        }
      } else {
        console.log(err);
      }
    }
    console.log(' ###### start of showRequestProcess ######');
    if (axiosResponse) {
      console.log(' --- request --- ');
      const config = axiosResponse.config;
      const urlObject = url.parse(config.url);
      console.log(`${config.method.toUpperCase()} ${urlObject.path} ${urlObject.protocol}`);
      console.log(config.headers);
      console.log(config.data ? config.data : '');
      // console.log(axiosResponse.request.getHeaders());
      console.log(' ---response general--- ');
      console.log(`${axiosResponse.status} ${axiosResponse.statusText}`);
      console.log(' ---response headers--- ');
      console.log(axiosResponse.headers);
      console.log(' ---response body--- ');
      console.log(axiosResponse.data.length > 1000 ? axiosResponse.data.substring(0, 1000) : axiosResponse.data);
    } else {
      console.log(`axiosResponse is null`);
    }
    console.log(' ###### end of showRequestProcess ######');
    return axiosResponse;
  }

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