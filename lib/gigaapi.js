'use strict';

var template = require('lodash.template');
var debug = require('debug')('gigaapi');
var bluebird = require('bluebird');
var request = bluebird.promisify(require('request'));
var api = template('http://api.gigatools.com/<%= type %>.json');

function _request(url, qs) {
  return request({
    uri: url,
    json: true,
    useQuerystring: true,
    qs: qs
  }).spread(function(res, body) {
    debug(decodeURI(res.req.path));
    if (!Array.isArray(body)) {
      throw new Error('body is not an array but is a ' + typeof body);
    }

    if (body.length < 2 && body[1].length === 0) {
      throw new Error('there is no data available for ' + decodeURI(res.req.path));
    }

    return body[1];
  });
}

module.exports = function(apiKey) {
  return {
    country: function(countries) {
      var countryapi = api({
        type: 'country'
      });

      return _request(countryapi, {
        'countries[]': countries,
        'api_key': apiKey
      });
    },
    countryByDates: function(countries, startDate, endDate) {
      var countryapi = api({
        type: 'country'
      });

      return _request(countryapi, {
        'countries[]': countries,
        'to_date[]': endDate,
        'from_date[]': startDate,
        'api_key': apiKey
      });
    }
  };
};