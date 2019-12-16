#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const util = require('util');
const crypto = require('crypto');
const readline = require('readline');
const childProcess = require('child_process');
const commander = require('commander');
const bytes = require('bytes');
const NodeUtils = require('../utils/node');
const nodeUtils = new NodeUtils();

commander.addImplicitHelpCommand();

commander.command('ps').action(() => {
  const cmdPS = nodeUtils.spawnCmdPS();
  cmdPS.stdout.pipe(process.stdout);
  cmdPS.stderr.pipe(process.stderr);
});

commander.command('kill <pid>').action(async (pid) => {
  try {
    // process.kill(pid, 'SIGTERM');
    // console.log(pid);
    const pidKilled = await nodeUtils.killByPid(pid);
    console.log(`killed: ${pidKilled}`);
  } catch (err) {
    console.log(err);
  }
  // const cmdPS = nodeUtils.spawnCmdPS();
  // cmdPS.stdout.pipe(process.stdout);
  // cmdPS.stderr.pipe(process.stderr);
});

commander.command('md5 <content>').action(async (content) => {
  console.log(crypto.createHash('md5').update(content).digest('hex'))
});

commander.command('lines-count <dir>')
  .description('show lines count of all files under a directory')
  .action(async dir => {
    require('../tools/commands/lines-count.js')(dir);
  });

commander.command('size <dir>')
  .description('show size of file(dir)')
  .option('-m, --max-depth <maxDepth>', 'max dir depth', null)
  .action(async (dir, command) => {
    const format = (tree) => {
      const traverse = it => {
        var result = [];
        if (it.hasOwnProperty('children')) {
          result = it['children'].map(traverse).reduce((sum, it) => sum.concat(it), result);
          result.push({
            size: it.size,
            depth: it.depth,
            file: it.file
          });
        } else {
          result.push({
            size: it.size,
            depth: it.depth,
            file: it.file
          });
        }
        return result;
      }
      return traverse(tree);
    }
    var {maxDepth} = command;
    var results = format(require('fs-readdir-recursive/file-size')(dir));
    // console.log(JSON.stringify(results))
    // return;
    if (maxDepth) {
      results = results.filter(it => it.depth <= maxDepth);
    }
    results.forEach(it => {
      console.log(`${bytes(it.size)}\t\t${it.file}(${it.depth})`);
    });
  })

commander.command('find <key>')
  .description('find file by key')
  .option('-d, --dir <directory>', 'data to post', '.')
  .option('-m, --max-depth <maxDepth>', 'max dir depth', null)
  .action(async (key, command) => {
    var {dir, maxDepth} = command;
    dir = path.resolve(dir);
    console.log(`searching dir: ${dir}`);
    console.log('');
    const readDirRecursive = require('fs-readdir-recursive/advance')({
      withDir: true,
      maxDepth
    });
    const fileList = readDirRecursive(dir);
    const reg = new RegExp(key);
    const result = fileList.filter(it => {
      return reg.test(it);
    });
    if (result.length === 0) {
      console.log('not found');
    } else {
      console.log(`${result.length} files found:`);
      result.forEach(it => console.log(it));
    }
  });


commander.command('rm <key>')
  .description('rm file by key')
  .option('-d, --dir <directory>', 'data to post', '.')
  .option('-m, --max-depth <maxDepth>', 'max dir depth', null)
  .action(async (key, command) => {
    var {dir, maxDepth} = command;
    dir = path.resolve(dir);
    console.log(`target dir: ${dir}`);
    console.log('');
    const readDirRecursive = require('fs-readdir-recursive/advance')({
      withDir: true,
      maxDepth
    });
    if (!fs.statSync(dir).isDirectory()) {
      console.log(`Error: ${dir} is not directory!`);
      return;
    }
    const reg = new RegExp(key);
    const fileList = readDirRecursive(dir, f => f).filter(it => reg.test(it));
    if (fileList.length === 0) {
      console.log('not file found');
      return;
    }
    console.log('files to delete:');
    fileList.forEach(it => console.log(it));

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    answer = await new Promise((resolve, reject) => {
      rl.question('你确定要删除这些文件？(yes/y)', (answer) => {
        resolve(answer);
        rl.close();
      });
    });
    if (['yes', 'y'].includes(answer)) {
      fileList.forEach(it => {
        try {
          const theFile = path.resolve(dir, it);
          fs.statSync(theFile);
          nodeUtils.deleteFile(theFile);
          console.log(`deleted: ${theFile}`);
        } catch (err) {}
      });
      console.log(`deleted: ${fileList.length}`);
    } else {
      console.log('取消删除');
    }
  });

commander.command('ssl-keys <domain>').action(async domain => {
  require('../tools/commands/ssl-keys/generator.js')(domain);
});

commander.command('post <url>')
  .option('-d, --data <data>', 'data to post', '{}')
  .option('-t, --content-type <contentType>', 'data to post', 'json')
  .action(async (url, command) => {
    var {data, contentType} = command;
    const contentTypeMap = {
      json: 'application/json',
      urlencoded: 'application/x-www-form-urlencoded',
      form:'multipart/form-data'
    };
    if (contentTypeMap.hasOwnProperty(contentType)) {
      contentType = contentTypeMap[contentType];
    } else {
      contentType = contentTypeMap['json'];
    }
    // console.log(url, data, contentType);
    nodeUtils.showRequestProcess({
      method: 'post',
      url,
      data,
      headers: {
        'content-type': contentType
      }
    })
  });

commander.command('get <url>')
  .option('-h, --headers <headers>', 'headers for get, json string or file path', '{}')
  // .option('-d, --data <data>', 'data to post', '{}')
  // .option('-t, --content-type <contentType>', 'data to post', 'json')
  .action(async (url, command) => {
    var {headers} = command;
    if (fs.existsSync(path.resolve(headers))) {
      headers = await nodeUtils.getStreamData(fs.createReadStream(path.resolve(headers)));
      headers = headers.toString();
    }
    try {
      // may be in form of json string
      headers = JSON.parse(headers);
    } catch (err) {
      // may be string translated from stream
      const isOK = headers.split('\n').filter(it => it).every(it => it.indexOf(':') > -1);
      if (!isOK) {
        console.log('bad format: headers');
        return;
      }
      const results = {};
      headers.split('\n').filter(it => it).forEach(it => {
        const loc = it.indexOf(':');
        const key = it.slice(0, loc).trim();
        const value = it.slice(loc + 1).trim();
        results[key] = value;
      });
      headers = results;
    }
    nodeUtils.showRequestProcess({
      method: 'get',
      url,
      headers
    })
  });

  commander.command('ip <func> [args...]')
    .action(async(func, args, command) => {
      const ip = require('ip');
      console.log(ip[func](...args));
    })

  commander.command('port-check <host> <port>')
    .action(async(host, port, args, command) => {
      console.log(host, port);
      const isOK = await nodeUtils.isPortOpen(host, port);
      console.log(`isOK: ${isOK}`);
      // const ip = require('ip');
      // console.log(ip[func](...args));
    })

  commander.command('port-scan <host>')
    .option('-e, --end-port <endPort>', 'end of scan scope', '10000')
    .action(async(host, command) => {
      const {endPort} = command;
      await nodeUtils.portsScan(host, endPort);
    })

// commander
//   .command('setup [env]')
//   .description('run setup commands for all envs')
//   .option("-s, --setup_mode [mode]", "Which setup mode to use")
//   .action(function(env, options){
//     var mode = options.setup_mode || "normal";
//     env = env || 'all';
//     console.log('setup for %s env(s) with %s mode', env, mode);
//   });


commander.parse(process.argv);