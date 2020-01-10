const fs = require('fs');
const path = require('path');
const zlib = require('zlib')
const Stream = require('stream');
const config = require('../config');

// NOTICE: 
const nodeUtils = new (require('../../../utils/node'))();
const nodeTools = new (require('../../../tools'))();

// 注意require('koa-router')返回的是函数:
const router = require('koa-router')();

/**
 * custom body
 * slow: true of false
 * wait: time in seconds
*/
async function handleBody(ctx, next, body) {
  if (!body) {
    return next();
  }
  if (nodeUtils.isPlainObject(body)) {
    body = JSON.stringify(body);
  }
  if (Buffer.isBuffer(body)) {
    body = body.toString();
  }
  if ('string' == typeof body) {
    body = nodeUtils.toStream(body);
  }
  // if (body instanceof Stream) {
  //   if (ctx.acceptsEncodings('gzip') === 'gzip' && (ctx.get['content-encoding'] !== 'gzip')) {
  //     ctx.set('content-encoding', 'gzip');
  //     body = body.pipe(zlib.createGzip());
  //   }
  // }

  // const withCookie = ctx.query['cookie'];
  // if (withCookie) {
  //   var count = ~~ctx.cookies.get('count') + 1;
  //   ctx.cookies.set('count', count);
  //   ctx.cookies.set('rich', 'with all config', {
  //     maxage: 1000 * 6,
  //     httpOnly: false
  //   });
  // }

  // const feature = ctx.query.feature;
  const slow = ctx.query['slow'];
  var wait = ctx.query['wait'];
  if (wait) {
    try {
      wait = parseInt(wait);
    } catch(err) {
      wait = 5;
    }
  }
  
  if (slow) {
    const slowTransform = nodeUtils.slowStream(1024, 500);
    body = body.pipe(slowTransform);
  }
  if (wait) {
    await nodeUtils.waitMilliSeconds(wait * 1000);
  }
  return body;
}

// common get
router.get('/api/test', async(ctx, next) => {
  let req = ctx.req; // 原request
  let res = ctx.res; // 原response
  const extension = ctx.query['extension'];

  const getStreamByType = (extension) => {
    var body = null;
    switch (extension) {
      case 'xml':
        ctx.type = 'xml';
        body = nodeUtils.toStream('<div>this is a div</div>');
        break;
      case 'png':
        ctx.type = 'png';
        body = fs.createReadStream(path.resolve(config.BASE_DIR, 'assets/imgs/gnu-icon-small.png'));
        break;
      case 'js':
        ctx.type = 'js';
        body = fs.createReadStream(path.resolve(config.BASE_DIR, 'api/test.js'));
        break;
      case 'arraybuffer':
      case 'bin':
        // TODO: not used
        ctx.type = 'bin';
        body = fs.createReadStream(path.resolve(config.BASE_DIR, 'api/test.js'));
        break;
      default:
        body = nodeUtils.toStream(ctx.url);
        break;
    }
    return body;
  }
  
  body = getStreamByType(extension ? extension : 'js');
  ctx.body = await handleBody(ctx, next, body);
});

router.post('/api/test', async(ctx, next) => {
  const {multipart, originData} = await nodeTools.parseByFormidable(ctx.req);

  ctx.type = 'json';
  ctx.body = multipart;
  // console.log(ctx.body);
  handleBody(ctx, next);
});

router.all('/api/test/echo', async(ctx, next) => {
  const {multipart, originData} = await nodeTools.parseByFormidable(ctx.req);

  ctx.type = 'json';
  ctx.body = {
    general: `${ctx.method} ${ctx.path} ${ctx.protocol}`,
    url: ctx.url,
    headers: ctx.headers,
    // body: buf.toString()
    requestBody: multipart,
    requestData: originData
  };
  // console.log(ctx.body);
  handleBody(ctx, next);
});

router.all('/api/test/error', async(ctx, next) => {
  ctx.throw(200, {
    message: JSON.stringify({
      success: false,
      msg: '错误信息'
    })
  });
});

router.post('/api/test/upload', async(ctx, next) => {
  const {multipart, originData} = await nodeTools.parseByFormidable(ctx.req);

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
      console.log(`write file ${path.resolve(uploadDir, `${file.hash}.${basename}${ext}`)}`);
      fs.writeFileSync(path.resolve(uploadDir, `${file.hash}.${basename}${ext}`), file.data);
    });
  }
  ctx.type = 'json';
  ctx.body = multipart;
});

module.exports = router;
