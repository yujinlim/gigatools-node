/*jshint -W089 */
'use strict';

var pluck            = require('lodash.pluck');
var filter           = require('lodash.filter');
var groupBy          = require('lodash.groupby');
var isEmpty          = require('lodash.isempty');
var moment           = require('moment');
var debug            = require('debug')('gigatools');

var APIKEY           = 'e74ac7d091e3cdc3d3';
var api              = require('./gigaapi')(APIKEY);
var store            = require('./datastore');
var countriesUtil    = require('./countries');

var DATE_TIME_FORMAT = 'YYYY-MM-DD';

function _saveData(events, dataStore) {
  events = groupBy(events, 'country');

  for (var country in events) {
    debug(country);
    var data = events[country];
    var dataByDate = groupBy(data, 'eventdate');
    for (var date in dataByDate) {
      var eventsData = dataByDate[date];
      dataStore.create(country, date, eventsData);
    }
  }
}

module.exports = function(size, page, baseDir) {
  var baseDataDir = baseDir || './countries';
  debug(baseDataDir);
  var dataStore   = store(baseDataDir);
  var countries   = countriesUtil.getCountriesByType(dataStore, size, page);
  debug(countries);
  if (isEmpty(countries)) {
    throw new Error('countries are not available for this batch : ' + page);
  }

  return {
    clean: function(start) {
      var end = moment().format(DATE_TIME_FORMAT);
      start = start ? moment(start).format(DATE_TIME_FORMAT) : moment(['1970', '0', '01']).format(DATE_TIME_FORMAT);

      var cleanCountries = pluck(
        filter(countries, 'clean'), 'name');

      debug(cleanCountries, start, end);

      // if (isEmpty(cleanCountries)) {
      //   throw new Error('countries are not available for this clean run on batch : ' + page);
      // }

      return api
        .countryByDates(cleanCountries, start, end)
        .then(function(events) {
          _saveData(events, dataStore);
        })
        .catch(function(err) {
          debug(err.stack);
        });
    },
    continuous: function() {
      var continuousCountries = pluck(filter(countries, {
        clean: false
      }), 'name');

      debug(continuousCountries);

      // if (isEmpty(continuousCountries)) {
      //   throw new Error('countries are not available for this continuous run on batch : ' + page);
      // }

      return api
        .country(continuousCountries)
        .then(function(events) {
          _saveData(events, dataStore);
        })
        .catch(function(err) {
          debug(err.stack);
        });
    }
  };
};