#!/usr/bin/env node
'use strict'
const path = require('path');
const commander = require('commander');
const KoaServer = require('../assist/koa-server');


const program = new commander.Command();

program
  .option('-s, --static <path>', 'set static dir', '')
  .option('-u, --upload <path>', 'set upload dir', '')
  .option('-p, --port [string]', 'as a server for test', null);

program.parse(process.argv);

var port = null;

new KoaServer({
  staticDir: path.resolve(program.static),
  uploadDir: path.resolve(program.upload),
}).start();


