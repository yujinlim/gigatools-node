'use strict';

var template = require('lodash.template');
var isArray = require('lodash.isarray');
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

    if (body.length < 2 || body[1].length === 0) {
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

      debug(countryapi);

      return _request(countryapi, {
        'countries[]': countries,
        'api_key': apiKey
      });
    },
    countryByDates: function(countries, startDate, endDate) {
      var countryapi = api({
        type: 'country'
      });

      debug(countryapi);

      return _request(countryapi, {
        'countries[]': countries,
        'to_date[]': endDate,
        'from_date[]': startDate,
        'api_key': apiKey
      });
    },
    venue: function(venues) {
      var venueApi = api({
        type: 'venue'
      });

      debug(venueApi);

      return _request(venueApi, {
        'api_key': apiKey,
        'venues[]': venues
      });
    },
    venueByDate: function(venues, startDate, endDate) {
      var venueApi = api({
        type: 'venue'
      });

      debug(venueApi);

      return _request(venueApi, {
        'api_key': apiKey,
        'venues[]': venues,
        'from_date[]': startDate,
        'to_date[]': endDate
      });
    },
    city: function(cities) {
      var cityApi = api({
        type: 'city'
      });

      debug(cityApi);

      return _request(cityApi, {
        'api_key': apiKey,
        'cities[]': cities
      });
    },
    cityByDates: function(cities, startDate, endDate) {
      var cityApi = api({
        type: 'city'
      });

      debug(cityApi);

      return _request(cityApi, {
        'api_key': apiKey,
        'cities[]': cities,
        'from_date[]': startDate,
        'to_date[]': endDate
      });
    },
    all: function() {
      var gigsApi = api({
        type: 'gigs'
      });

      debug(gigsApi);

      return _request(gigsApi, {
        'api_key': apiKey
      });
    },
    dates: function(startDate, endDate) {
      var gigsApi = api({
        type: 'gigs'
      });

      debug(gigsApi);

      return _request(gigsApi, {
        'api_key': apiKey,
        'from_date[]': startDate,
        'to_date': endDate
      });
    },
    usersBySoundCloudIds: function(ids) {
      var searchApi = api({
        type: 'search'
      });

      debug(searchApi);

      if (isArray(ids)) {
        ids = ids.join(',');
      }

      return _request(searchApi, {
        'api_key': apiKey,
        'soundcloud_user_ids': ids
      });
    },
    users: {
      mixCloudUsername: function(username) {
        var searchApi = api({
          type: 'search'
        });

        debug(searchApi);
        return _request(searchApi, {
          'api_key': apiKey,
          'mixcloud_username': username
        });
      },
      twitter: function(username) {
        var searchApi = api({
          type: 'search'
        });

        debug(searchApi);

        return _request(searchApi, {
          'api_key': apiKey,
          'twitter_username': username
        });
      },
      soundcloud: function(username) {
        var searchApi = api({
          type: 'search'
        });

        debug(searchApi);

        return _request(searchApi, {
          'api_key': apiKey,
          'soundcloud_username': username
        });
      }
    }
  };
};