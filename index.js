// CLI tools
var bluebird  = require('bluebird');
var debug     = require('debug')('index');
var size      = 20;

// requires parameters
var page      = process.env.batch || 1;
var startDate = process.env.start;
var dataDir   = process.env.dataDir;
debug(page, startDate, dataDir);
var gigatool  = require('./lib/gigatool')(size, page, dataDir);

bluebird.all([gigatool.clean(startDate), gigatool.continuous()])
  .finally(function(){
    process.exit(0);
  });