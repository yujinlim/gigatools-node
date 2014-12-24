'use strict';
var chai = require('chai');
var proxyquire = require('proxyquire');
var bluebird = require('bluebird');
var expect = chai.expect;

describe('Gigaapi', function() {
  var gigaApi;
  before(function() {
    gigaApi = require('../lib/gigaapi');
  });

  it('should be define', function() {
    expect(gigaApi).to.not.be.undefined;
  });

});

describe('Gigaapi#country', function() {
  var requestStub = {};
  var countries = ['Argentina'];
  var apiKey = '123';
  var gigaApi;

  it('should have called with appropriate data', function() {
    proxyquire.noCallThru();
    gigaApi = proxyquire('../lib/gigaapi', {
      request: function(data) {
        expect(data.uri).to.not.be.undefined;
        expect(data.qs).to.be.a('object');
        expect(data.qs['countries[]']).to.eql(countries);
      }
    });

    gigaApi(apiKey).country(countries);
  });

  describe('Gigaapi#country#validations', function(done) {
    proxyquire.noCallThru();
    
    var request = function(){
      return new bluebird(function() {
        return [];
        done();
      });
    };

    gigaApi = proxyquire('../lib/gigaapi', {
      request: request
    });

    gigaApi(apiKey).country(countries);
  });
});