'use strict';

var chai = require('chai');
var proxyquire = require('proxyquire');
var bluebird = require('bluebird');
var expect = chai.expect;

describe('DataStore', function() {
  var datastore;

  before(function(){
    datastore = require('../lib/datastore');
  });

  it('should be defined', function() {
    expect(datastore).to.be.not.undefined 
  });
});