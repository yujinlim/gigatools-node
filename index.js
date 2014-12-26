#!/usr/bin/env node

var bluebird  = require('bluebird');
var gigatool  = require('./lib/gigatool');
var debug     = require('debug')('index');
var size      = 20;

var page      = process.env.BATCH;
var startDate = process.env.START;
var dataDir   = process.env.DATADIR;
debug(page, startDate, dataDir);

// requires parameters
if (!process.env.BATCH) {
  throw new Error('BATCH environment variable is needed');
}

tool = gigatool(size, page, dataDir);

module.exports = bluebird.all([tool.clean(startDate), tool.continuous()])
  .finally(function(){
    if (!process.env.TEST) {
      process.exit(0);
    }
  });