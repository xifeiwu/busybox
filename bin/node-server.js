#!/usr/bin/env node
'use strict'
const path = require('path');

const NativeServer = require('../assist/native-server');

var options = {
  staticDir: null,
}

if (process.argv.length >= 3) {
  options.staticDir = path.resolve(process.argv[2]);
}

new NativeServer(options).start();