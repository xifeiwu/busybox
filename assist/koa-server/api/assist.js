const fs = require('fs');
const path = require('path');
const router = require('koa-router')();
const nodeUtils = new (require('../../../utils/node'))();

httpProxy = require('node-http-proxy');

router.post('/api/assist/upload', async(ctx, next) => {
  ctx.assert(ctx.request.body, 200, nodeUtils.error({
    msg: 'body not found'
  }));

  const multipart = ctx.request.body;
  var fileList = [];
  Object.keys(multipart.files).forEach(key => {
    fileList = fileList.concat(multipart.files[key]);
  });
  if (fileList.length > 0) {
    const uploadDir = path.resolve(ctx.app.UPLOAD_DIR, 'uploads');
    // mkdir uploads if necessary
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    fileList.forEach(file => {
      var ext = path.extname(file.name);
      const basename = path.basename(file.name, ext);
      // ext = ext.replace(/(\.[a-z0-9]+).*/i, '$1');
      fs.writeFileSync(path.resolve(uploadDir, `${file.hash}.${basename}${ext}`), file.data);
    });
  }
  ctx.type = 'json';
  ctx.body = ctx.request.body;
});

router.all('/api/assist/proxy', async (ctx, next) => {
  var {target} = ctx.query;
  ctx.assert(target, 400, 'target is required in querystring');

  target = new URL(target);

  const proxy = httpProxy.createServer();
  const start = Date.now();
  await new Promise((resolve, reject) => {
    ctx.req.url = target.pathname;
    proxy.web(ctx.req, ctx.res, {
      proxyTimeout: 30000,
      target: target.origin,
      changeOrigin: true
    });
    proxy.once('error', err => {
      reject(err);
    });
    proxy.once('end', err => {
      ctx.respond = false;
      console.log(`proxy to ${target.href}[${Date.now() - start}]`);
      resolve();
    });
  });
});


module.exports = router;