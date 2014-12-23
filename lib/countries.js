'use strict';

var pluck     = require('lodash.pluck');
var debug     = require('debug')('countriesUtils');

var countries = require('../data/countries');

var utilities = module.exports = {
  getCountries: function(size, page) {
    return pluck(countries.slice((page - 1) * size, page * size), 'name');
  },
  getCountriesByType: function(datastore, size, page) {
    var filteredCountries = utilities.getCountries(size, page);
    
    return filteredCountries.map(function(country) {
      debug(country);
      if (datastore.exists(country)) {
        debug(country);
        return {
          name: country,
          clean: false
        };
      }

      return {
        name: country,
        clean: true
      };
    });
  }
};