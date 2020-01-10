const fs = require('fs');
const path = require('path');
const net = require('net');
const NodeUtils = require('../utils/node');
const formidable = require('formidable');

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


  // parse body for all post, results is saved to ctx.request.body
  // ?save=true, save file or not
  async parseByFormidable(request) {
    var form = new formidable.IncomingForm({
      keepExtensions: true,
      multiples: true,
      maxFileSize: 1024 * 1024 * 1024,
      hash: 'md5'
    });
    // console.log('start parse');
    const [multipart, originData] = await Promise.all([
      new Promise((resolve, reject) => {
        // form.on('progress', (bytesReceived, bytesExpected) => {
        //   console.log(`${bytesReceived} / ${bytesExpected}`);
        // });
        form.parse(request, (err, fields, files) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              fields,
              files
            });
          }
        });
      }),
      new Promise((resolve, reject) => {
        var bufSize = 0;
        var bufferList = [];
        request.on('data', function(chunk){
          bufSize += chunk.length;
          if (bufSize > 512 * 1024 * 1024) {
            return;
          }
          bufferList.push(chunk);
        });
        request.on('end', function() {
          resolve(Buffer.concat(bufferList));
        });
        request.on('error', function(err) {
          reject(err);
        })
      })
    ])
    // console.log(multipart);
    // console.log(originData);

    // logic of save file
    if (false) {
      var fileList = [];
      Object.keys(multipart.files).forEach(key => {
        fileList = fileList.concat(multipart.files[key]);
      });

      if (fileList.length > 0) {
        const uploadDir = path.resolve(__dirname, 'uploads');
        // mkdir uploads if necessary
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir);
        }
        fileList.forEach(file => {
          var ext = path.extname(file.name);
          const basename = path.basename(file.name, ext);
          // ext = ext.replace(/(\.[a-z0-9]+).*/i, '$1');
          fs.writeFileSync(path.resolve(uploadDir, `${file.hash}.${basename}.${ext}`), file.data);
        });
      }
    }

    return {
      multipart,    // multipart data parsed by formidable
      originData    // origin data received from request
    }
  }

  // async koaBodyParser(ctx, next) {
  //   var body = data = null;
  //   if (ctx.method !== 'POST') {
  //     return {body, data};
  //   }
  // }


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