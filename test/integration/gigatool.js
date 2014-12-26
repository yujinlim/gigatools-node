/*jshint expr: true*/
'use strict';

var chai = require('chai');
var fs = require('fs');
var rimraf = require('rimraf');
var async = require('async');
var moment = require('moment');
var rimraf = require('rimraf');
var partial = require('lodash.partial');

var expect = chai.expect;

function run(path, cb) {
  require('../../index')
    .finally(function() {
      delete require.cache[require.resolve('../../index')];
      cb(null, fs.readdirSync(path));
    });
}

describe('clean run', function() {
  this.timeout(30000); // api call
  var dataDir = './countries';
  var path = dataDir + '/Albania';

  before(function(done) {
    process.env.BATCH = 1;
    process.env.TEST = true;
    require('../../index')
      .finally(done);
  });

  after(function(done) {
    delete require.cache[require.resolve('../../index')];
    rimraf(dataDir, done);
  });

  it('should create folder for data directory', function() {
    expect(fs.existsSync(dataDir)).to.be.true;
  });

  it('should have create folder for country that has events, `Albania`', function() {
    expect(fs.existsSync(path)).to.be.true;
  });

  it('should have files in the country that have events, `Albania`', function() {
    expect(fs.readdirSync(path)).to.have.length.above(0);
  });
});

describe('continous run', function() {
  var dataDir = './countries';
  var path = dataDir + '/Albania';
  var cleanFiles, continousFiles;
  var getCount = partial(run, path);

  this.timeout(40000);
  before(function(done) {
    process.env.BATCH = 1;
    process.env.TEST = true;

    async.series([function(cb) {
      getCount(cb);
    }, function(cb) {
      getCount(cb);
    }], function(err, values) {
      cleanFiles = values[0];
      continousFiles = values[1];
      done();
    });
  });

  after(function(done) {
    rimraf(dataDir, done);
  });

  it('should have more files after continous run', function() {
    expect(continousFiles).to.have.length.above(cleanFiles.length);
  });

  it('should have files that dated in the future', function() {
    var count = 0;
    var today = moment();

    continousFiles.forEach(function(fileName) {
      var splitNames = fileName.split('.');
      if (splitNames.length > 0) {
        var date = moment(splitNames[0]);
        if (date.isSame(moment(today.format('YYYY-MM-DD'))) || date.isAfter(today)) {
          count++;
        }
      }
    });

    expect(count).to.be.above(0);
  });
});

describe('batches', function() {
  var firstBatch, secondBatch;
  var dataDir = './countries';

  this.timeout(60000);
  before(function(done) {
    process.env.TEST = true;
    var getFiles = partial(run, dataDir);
    async.series([function(cb) {
      process.env.BATCH = 2;
      getFiles(cb);
    }, function(cb) {
      process.env.BATCH = 3;
      getFiles(cb);
    }], function(err, files) {
      firstBatch = files[0];
      secondBatch = files[1];
      done();
    });
  });

  after(function(done) {
    rimraf(dataDir, done);
  });

  it('should have more countries folder', function() {
    expect(secondBatch).to.have.length.above(firstBatch.length);
  });
});