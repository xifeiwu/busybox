
const fs = require('fs');
const path = require('path');
const http = require('http');
const util = require('util');
const Koa = require('koa');
const router = require('koa-router')();
const formidable = require('formidable');
const staticCache = require('koa-static-cache');
const nodeUtils = new (require('../../utils/node'))();
const config = require('./config.js');


// const debug = require('debug');
// debug.getState().setConfigs({
//   useColors: true,
//   debug: 'koa*'
// });
// console.log(debug.getState().getConfig());

process.on('error', err => {
  console.log(err);
});
process.on('uncaughtException', (e) => {
  console.log(`uncaughtException: ${e}`);
  console.log(e);
});
process.on('beforeExit', (e) => {　　
  console.log(`beforeExit: ${e}`);
  console.log(e);
  process.exit();
});
process.on('unhandledRejection', err => {
  console.log('unhandledRejection');
  console.log(err);
});

module.exports = class KoaServer {
  constructor(options = {
    staticDir: null,
    uploadDir: null,
  }) {
    this.STATIC_DIR = options.staticDir ? path.resolve(options.staticDir) : config.BASE_DIR;
    this.UPLOAD_DIR = options.uploadDir ? path.resolve(options.uploadDir) : config.BASE_DIR;
    // dir check
    [this.STATIC_DIR, this.UPLOAD_DIR].forEach(dir => {
      var stats = fs.statSync(dir);
      if (!stats.isDirectory()) {
        throw new Error(`${dir} is not a directory`);
      }
    });
    console.log(util.inspect({
      staticDir: this.STATIC_DIR,
      uploadDir: this.UPLOAD_DIR
    }, {colors: true}));
  }

  async start(port = null) {
    try {
      port = port ? port : config.port;
      const host = nodeUtils.getLocalIP();
      const app = new Koa();
      app.on('error', err => {
        console.log(err);
      });
      app.UPLOAD_DIR = this.UPLOAD_DIR;
      this.setLogger(app);
      // parseByFormidable should be used before all api-related middleware
      this.parseByFormidable(app);
      this.setApi(app);
      // match static file at last
      this.setStatic(app);

      // app.listen(port);
      const server = http.createServer(app.callback());
      server.listen(port);
      return new Promise((resolve, reject) => {
        server.on('error', (err) => {
          console.log(err);
          reject(err);
        });
        server.on('listening', () => {
          console.log(`start server: http://${host}:${port}`);
          resolve({app, server, host, port});
        });
      });
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  setLogger(app) {
    app.use(async(ctx, next) => {
      console.log(`${ctx.url}`);
      await next();
      if (!ctx.body) {
        ctx.body = 'default response';
      }
    });
    app.on('error', err => {
      console.log('err catched started:');
      console.log(err);
      console.log('err catched end');
    })
  }

  setStatic(app) {
    app.use(staticCache(this.STATIC_DIR, {
      // prefix: '',
      // maxAge: 365 * 24 * 60 * 60,
      // buffer: true,
      dynamic: true,
      preload: false,
      dirContent(stat) {
        return Buffer.from(nodeUtils.getDirContentInFormOfHtml(stat.path))
      }
    }));
    app.use(staticCache(path.resolve(config.BASE_DIR, 'assets'), {
      prefix: '/assets',
      // prefix: '',
      // maxAge: 365 * 24 * 60 * 60,
      // buffer: true,
      dynamic: true,
      preload: false,
      dirContent(stat) {
        return Buffer.from(nodeUtils.getDirContentInFormOfHtml(stat.path))
      }
    }));
    // NOTICE: do not provided as assests server(as it consume too much resource)
    // const fileStore = {
    //   fileMap: {},
    //   get(key) {
    //     return this.fileMap[key];
    //   },
    //   set(key, value) {
    //     this.fileMap[key] = value;
    //   }
    // };
    // if (this.provideService.assets) {
    //   const dirList = nodeUtils.findFileListByNameUpward(__dirname, 'assets');
    //   dirList.forEach(it => {
    //     app.use(staticCache(it, {
    //       prefix: '/assets',
    //       // maxAge: 365 * 24 * 60 * 60,
    //       // buffer: true,
    //       dynamic: true,
    //       preload: false,
    //       dirContent(stat) {
    //         return Buffer.from(nodeUtils.getDirContentInFormOfHtml(stat.path))
    //       }
    //     }, fileStore));
    //   });
    // }
  }

  // parse body for all post, results is saved to ctx.request.body
  // ?save=true, save file or not
  parseByFormidable(app) {
    app.use(async(ctx, next) => {
      if (ctx.method !== 'POST' || !ctx.path.startsWith('/api')) return await next();

      const uploadDir = this.uploadDir;
      var form = new formidable.IncomingForm({
        uploadDir,
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
          form.parse(ctx.req, (err, fields, files) => {
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
          ctx.req.on('data', function(chunk){
            bufSize += chunk.length;
            if (bufSize > 512 * 1024 * 1024) {
              return;
            }
            bufferList.push(chunk);
          });
          ctx.req.on('end', function() {
            resolve(Buffer.concat(bufferList));
          });
          ctx.req.on('error', function(err) {
            reject(err);
          })
        })
      ])
      // console.log(multipart);
      // console.log(originData);

      if (ctx.query['save']) {
        var fileList = [];
        Object.keys(multipart.files).forEach(key => {
          fileList = fileList.concat(multipart.files[key]);
        });

        if (fileList.length > 0) {
          const uploadDir = path.resolve(this.UPLOAD_DIR, 'uploads');
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
        // console.log(fileList);
      }

      // request.body refers to multipart data parsed by formidable
      // request.data refers to origin data posted by client
      ctx.request.body = multipart;
      ctx.request.data = originData;
      await next();
    });
  }

  setApi(app) {
    // app.use(require('./router').routes());
    app.use(require('./api/test.js').routes());
  }
}
// add router middleware:
// app.use(router.routes());

// app.listen(3001);

// const keysPath = busybox.nodeUtils.node.findClosestFile(__dirname, 'assets/files/https-keys');
// var options = {
//   key: fs.readFileSync(path.resolve(keysPath, 'server-key.pem')),
//   cert: fs.readFileSync(path.resolve(keysPath, 'server-cert.pem')),
//   ca: [fs.readFileSync(path.resolve(keysPath, 'ca-cert.pem'))]
// };

// const startHttps = process.env.protocol === 'https';

// if (startHttps) {
//   https.createServer(options, app.callback()).listen(3001);
//   console.log('server started: https://127.0.0.1:3001');
// } else {
//   http.createServer(app.callback()).listen(3001);
//   console.log('server started: http://127.0.0.1:3001');
// }