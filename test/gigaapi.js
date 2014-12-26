'use strict';
var chai = require('chai');
var proxyquire = require('proxyquire').noPreserveCache();
var bluebird = require('bluebird');
var expect = chai.expect;

// Unit Testing
describe('Gigaapi#country', function() {
  var requestStub = {};
  var countries = ['Argentina'];
  var apiKey = '123';
  var gigaApi;

  it('should have called with appropriate data', function(done) {
    proxyquire.noCallThru();
    gigaApi = proxyquire('../lib/gigaapi', {
      request: function(data) {
        expect(data.uri).to.not.be.undefined;
        expect(data.qs).to.be.a('object');
        expect(data.qs['countries[]']).to.eql(countries);
        done();
        return bluebird.resolve([])
      }
    });

    gigaApi(apiKey).country(countries);
  });
});