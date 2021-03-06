const fs = require('fs');
const os = require('os');
const net = require('net');
const url = require('url');
const path = require('path');
const http = require('http');
const childProcess = require('child_process');
const stream = require('stream');

const Common = require('./common.js');
const HOME_PATH = process.env["HOME"];

module.exports = class NodeUtils extends Common {
  constructor() {
    super();
  }

  // 等待ms毫秒
  async waitMilliSeconds(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  /**
   * start from @param 'dir', find one file with @param'name' upwards
   * @param dir, start dir
   * @param name, target file name
   */
  findClosestFile(dir, name) {
    let fullPath = path.resolve(dir, name);
    if (dir == HOME_PATH || dir == '/') {
      return null;
    }
    if (fs.existsSync(fullPath)) {
      return fullPath
    } else {
      return this.findClosestFile(path.resolve(dir, '..'), name)
    }
  }

  /**
   * start from @param 'dir', find file list with @param'name' upwards
   * @param dir, start dir
   * @param name, target file name
   */
  findFileListByNameUpward(dir, name) {
    var results = [];

    var currentPath = dir;
    while (currentPath !== HOME_PATH && currentPath !== '/' && currentPath !== null) {
      // console.log(currentPath);
      var toFind = path.resolve(currentPath, name);
      if (fs.existsSync(toFind)) {
        results.push(toFind);
      }
      currentPath = path.resolve(currentPath, '..')
    }

    return results;
  }

  // read dir recursive. return all files in dir root
  readDirRecursive(root, filter, files, prefix) {
    prefix = prefix || ''
    files = files || []
    filter = filter || (x => x[0] !== '.')
    var dir = path.join(root, prefix)
    if (!fs.existsSync(dir)) return files
    if (fs.statSync(dir).isDirectory())
      fs.readdirSync(dir)
      .filter((name, index) => {
        return filter(name, index, dir)
      })
      .forEach(name => {
        this.readDirRecursive(root, filter, files, path.join(prefix, name))
      })
    else
      files.push(prefix)
    return files
  }

  deleteFile(path) {
    if (fs.existsSync(path)) {
      if (fs.statSync(path).isFile()) {
        fs.unlinkSync(path);
      } else if (fs.statSync(path).isDirectory()) {
        fs.readdirSync(path).forEach((file, index) => {
          var curPath = path + "/" + file;
          if (fs.statSync(curPath).isDirectory()) { // recurse
            this.deleteFile(curPath);
          } else { // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(path);
      }
    } else {
      console.log(`Error: path ${path} not exist`);
    }
  }

  getModulePath(moduleName, currentPath) {
    const pathList = [];
    try {
      const globalDir = path.resolve(childProcess.execSync(`which node`).toString(), '../..', 'lib/node_modules');
      pathList.push(globalDir);
      pathList.push(path.resolve(currentPath, 'node_modules'));
      do {
        currentPath = path.resolve(currentPath, '..');
        if (!/.*node_modules$/.test(currentPath)) {
          pathList.push(path.resolve(currentPath, 'node_modules'));
        }
      } while (currentPath !== HOME_PATH)
    } catch(err) {
      console.log(err);
    }
    const fullPath = pathList.map(it => path.resolve(it, moduleName)).find(it => fs.existsSync(it));
    return fullPath;
  }

  /**
  process是一个全局变量，可以直接调用。
  process的属性，如下：
  version：包含当前node实例的版本号；
  installPrefix：包含安装路径；
  platform：列举node运行的操作系统的环境，只会显示内核相关的信息，如：linux2， darwin，而不是“Redhat ES3” ，“Windows 7”，“OSX 10.7”等；
  pid：获取进程id；
  title：设置进程名称；
  execPath：当前node进程的执行路径，如：/usr/local/bin/node；
  memoryUsage()：node进程内存的使用情况，rss代表ram的使用情况，vsize代表总内存的使用大小，包括ram和swap；
  heapTotal,process.heapUsed：分别代表v8引擎内存分配和正在使用的大小。
  argv：这是一个数组，数组里存放着启动这个node.js进程各个参数和命令代码；
  uptime()：包含当前进程运行的时长（秒）；
  getgid()：获取或者设置group id；
  setuid()：获取或者设计user id；
  cwd()：当前工作目录；
  exit(code=0)：kill当前进程；
  kill(pid, signal='SIGTERM')：发出一个kill信号给指定pid；
  nextTick(callback)：异步执行callback函数；
  umask([mask]) ：设置进程的user mask值；
  */
  getProcessInfo(p) {
    const results = {};
    [
      'version',    // 包含当前node实例的版本号；
      'release',    // 返回与当前发布相关的元数据对象
      'platform',   // 列举node运行的操作系统的环境，只会显示内核相关的信息，如：linux2， darwin，而不是“Redhat ES3” ，“Windows 7”，“OSX 10.7”等；
      'arch',       // 返回一个表示操作系统CPU架构的字符串，Node.js二进制文件是为这些架构编译的。 例如 'arm', 'arm64', 'x32', 或 'x64'
      'pid',        // 获取进程id
      'ppid',       // 获取父进程id
      'title',      // 设置进程名称
      'execPath',   // 当前node进程的执行路径，如：/usr/local/bin/node
      'arch',
    ].forEach(key => {
      results[key] = p[key];
    });
    [
      'memoryUsage',
      'cwd'
    ].forEach(key => {
      results[key] = p[key]();
    })
    return results;
  }

  // get stream returned by command
  spawnCmdPS() {
    var processLister;
    const props = ['pid', 'ppid', 'rss', 'vsz', 'pcpu', 'user', 'time', 'command'];
    if (process.platform === 'win32') {
      // win32 is not supported
      return [];
      // See also: https://github.com/nodejs/node-v0.x-archive/issues/2318
      // processLister = spawn('wmic.exe', ['PROCESS', 'GET', 'Name,ProcessId,ParentProcessId,Status']);
    } else {
      // ps -A -o 'pid,ppid,rss,vsz,pcpu,user,time,command'
      // pid:       process ID
      // ppid:      parent process ID
      // rss:       resident set size, 实际内存占用大小(单位killobytes)
      // vsz:       virtual size in Kbytes (alias vsize), 虚拟内存占用大小
      // pcup:      percentage CPU usage (alias pcpu)
      // command:   command and arguments  
      // time:      user + system
      processLister = childProcess.spawn('ps', ['-A', '-o', props.join(',')]);
    }
    return processLister;
  }
  // 获取所有进程的基本信息
  async getThreadsInfoAll() {
    const props = ['pid', 'ppid', 'rss', 'vsz', 'pcpu', 'user', 'time', 'command'];
    const processLister = this.spawnCmdPS();
    return new Promise((resolve, reject) => {
      const bufList = [];
      processLister.stdout.on('data', (data) => {
        bufList.push(data);
      });

      processLister.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        reject(data);
      });

      processLister.on('close', (code) => {
        const data = Buffer.concat(bufList).toString();
        const threads = data.toString().split('\n');
        const threadsList = threads.slice(1).map(it => {
          const items = it.trim().split(/\s+/);
          const result = {};
          props.forEach((it, index) => {
            if (index == (props.length -1)) {
              result[it] = items.slice(index).join(' ');
            } else {
              result[it] = items[index];
            }
          });
          return result;
        });
        // console.log(threadsList);
        resolve(threadsList);
      });
    });
  }

  // kill pid and its childpid
  async killByPid(pid, killTree = true) {
    const threadsInfo = await this.getThreadsInfoAll();
    const mainThread = threadsInfo.find(it => it.pid == pid);
    if (!mainThread) {
      return Promise.reject(`no thread with pid ${pid}`);
    }
    const pidKilled = [];
    const kill = (thread) => {
      pidKilled.push(thread.pid);
      process.kill(thread.pid, 'SIGTERM');
    }
    const traverseFind = (thread) => {
      if (!thread.hasOwnProperty('children')) {
        var children = threadsInfo.filter(it => it.ppid == thread.pid);
        if (children.length > 0) {
          thread.children = children;
          children.forEach(traverseFind);
        }
      }
    }
    const traverseKill = (thread) => {
      if (thread.hasOwnProperty('children')) {
        thread.children.forEach(traverseKill);
        delete thread.children;
        traverseKill(thread);
      } else {
        kill(thread);
      }
    }
    if (killTree) {
      traverseFind(mainThread);
      traverseKill(mainThread);
    } else {
      kill(mainThread);
    }
    return pidKilled;
  }

  // 通过pid获取线程基本信息
  async getThreadInfoByPid(pid) {
    const threadsInfoList = await this.getThreadsInfoAll();
    return threadsInfoList.find(it => it.pid == pid);
  }

  defaultResponse(response) {
    response.writeHead(200, {
      'Content-Type': 'html'
    });
    fs.createReadStream(path.resolve(__dirname, 'net.html')).pipe(response);
  }

  getLocalIP() {
    var localIP = null;
    var ifaces = os.networkInterfaces();
    var keys = ['en0', 'en1', 'en2', 'en3', 'en4', 'en5', 'em0', 'em1', 'em2', 'em3', 'em4', 'em5', 'eth0'];
    let iface = [];
    keys.forEach(function(key) {
      if ((key in ifaces) && (Array.isArray(ifaces[key]))) {
        iface = ifaces[key];
      }
    });
    iface.forEach(function(iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        return;
      }
      localIP = iface.address;
    });
    return localIP;
  }

  // check if the port of host is opened or not
  async isPortOpen(host, port) {
    return new Promise((resolve, reject) => {
      try {
        const socket = net.createConnection({host, port})
        socket.setTimeout(3000);
        socket.on('connect', () => {
          socket.destroy();
          resolve(true);
        });
        socket.on('timeout', () => {
          // console.log('timeout');
          socket.destroy();
          resolve(false);
        });
        socket.on('error', err => {
          // console.log(`${port} error`);
          resolve(false);
        });
      } catch (err) {
        resolve(false);
      }
    });
  }

  // scan port list and show the port opened
  async portsScan(host, endPort = 10000) {
    const startPort = 20;
    var port = startPort;
    while (port < endPort) {
      const isOpen = await this.isPortOpen(host, port);
      if (isOpen) {
        console.log(port);
      }
      port++;
    }
  }

  // 获取一个未被使用的端口（默认从3000端口开始）
  async getAFreePort(startPort = 3000) {
    const host = '127.0.0.1';
    const endPort = 10000;
    var port = startPort;
    while (port < endPort) {
      const isOpen = await this.isPortOpen(host, port);
      if (!isOpen) {
        return port;
      }
      port++;
    }
    throw new Error('not free port found');
  }

  // return file list in the form of <ul><li></li></ul>
  getFileListInFormOfUl(dir, filter) {
    filter = filter || (x => x[0] !== '.')
    try {
      var stat = fs.statSync(dir);
      if (!stat.isDirectory()) {
        throw new Error('not a directory');
      }
      const fileList = fs.readdirSync(dir);
      const liList = Array.prototype.slice.call(fileList).filter(filter).map((it) => {
        var item = '';
        // // pass hidden file
        // if (it.startsWith('.')) {
        //   return item;
        // }
        const statInfo = fs.statSync(dir + '/' + it);
        if (statInfo.isDirectory()) {
          // item = '<li><a href="' + it + '/">' + it + '/</a></li>';
          item = `<li><a href="${it}/">${it}/</a></li>`;
        } else if (statInfo.isFile()) {
          // item = '<li><a href="' + it + '">' + it + '</a></li>';
          item = `<li><a href="${it}">${it}</a></li>`;
        } else {
          // item = '<li style="color: red"><a href="' + it + '">' + it + '</a></li>';
          item = `<li style="color: red"><a href="${it}">${it}</a></li>`;
        }
        return item;
      });
      const ul = ['<ul>', ...liList, '</ul>'].join('');
      return ul;
    } catch (err) {
      return err.message;
    }
  }

  getDirContentInFormOfHtml(dir, filter) {
    const ul = this.getFileListInFormOfUl(dir, filter);
    return `<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, user-scalable=no" />
    <link rel="stylesheet" href="">
    <title>文件列表</title>
    <script>
    window.addEventListener('load', function() {
    });
    </script>
    <style>
    </style>
  </head>
  <body>
    ${ul}
  </body>
</html>`
  }

  /**
   * response for a file or dir
   */
  async getFileContentInFormOfStream(targetFile) {
    if (!targetFile) {
      return null;
    }
    if (!fs.existsSync(targetFile)) {
      return null;
    }

    const statInfo = fs.statSync(targetFile);
    if (statInfo.isDirectory()) {
      const body = this.getDirContentInFormOfHtml(targetFile);
      return new stream.Readable({
        read() {
          this.push(body);
          this.push(null);
        }
      });
    } else if (statInfo.isFile()) {
      return fs.createReadStream(targetFile);
    }
  }

  startBasicServer(cb) {
    let HTTPPORT = 0;
    let server = http.createServer((request, response) => {
      // this.showRequest(request);
      if (typeof(cb) !== 'function') {
        this.defaultResponse(response);
      } else {
        cb(request, response);
      }
    });
    server.listen(HTTPPORT);
    server.on('listening', () => {
      let port = server.address().port;
      let localIP = this.getLocalIP();
      console.log(`start at: http://${localIP}:${port}`);
    })
  }

  getParsedUrl(request) {
    // const 
    var urlString = 'http://' + request.headers['host'] + request.url;
    var obj = url.parse(urlString);
    if (obj.query) {
      obj.query = this.parseQueryString(obj.query);
    }
    return obj;
  }

  /**
   * @param {ctx}, ctx of koa
   * @param {next}, ctx of next
   * @param {prefix}, filter url started with prefix
   * @param {refDir}, the start dir from which to search target file
   */
  async koaMiddlewareResponseStatic(ctx, next, prefix, refDir = __dirname) {
    const url = ctx.url;

    if (url.startsWith(prefix)) {
      return await next();
    }
    const targetFile = this.findClosestFile(refDir, url.replace('/', ''));
    if (!targetFile) {
      return await next();
    }
    const statInfo = fs.statSync(targetFile);
    if (statInfo.isDirectory() && !url.endsWith('/')) {
      ctx.redirect(`${url}/`);
      return;
    }
    const resStream = await this.getFileStream4Response(targetFile);
    if (resStream) {
      if (statInfo.isDirectory()) {
        ctx.type = 'html';
      } else if (statInfo.isFile()) {
        ctx.type = targetFile.split('.').pop();
      }
      ctx.body = resStream;
    } else {
      return await next();
    }
  }

  getStreamData(req) {
    return new Promise((resolve, reject) => {
      var bufferList = [];
      req.on('data', function(chunk){
        // console.log(chunk);
        // result += chunk;
        bufferList.push(chunk);
      });
      req.on('end', function() {
        resolve(Buffer.concat(bufferList));
      });
      req.on('error', function(err) {
        reject(err);
      })
    })
  }

  /**
   * @param {data}, String or Object
   */
  toStream(data) {
    if (Buffer.isBuffer(data)) {
      data = data.toString();
    }
    if (this.isObject(data)) {
      data = JSON.stringify(data);
    }
    if (!this.isString(data)) {
      conosle.log(`warning: data should be string or buffer`);
    }
    return new stream.Readable({
      read() {
        this.push(data);
        this.push(null);
      }
    });
  }

  // TODO: fix stream.push() after EOF
  slowStream(chunkSize = 1024, wait = 500) {
    var self = this;
    return new stream.Transform({
      async transform(data, enc, next) {
        const dataSize = data.length;
        var pos = 0;
        var chunk = null;
        while (pos < dataSize) {
          var size = chunkSize;
          if (pos + chunkSize > dataSize) {
            size = dataSize - pos;
          }
          chunk = Buffer.alloc(size);
          data.copy(chunk, 0, pos, pos + size);
          await self.waitMilliSeconds(wait);
          this.push(chunk);
          pos += size;
        }
        next();
      }
    })
  }
}
