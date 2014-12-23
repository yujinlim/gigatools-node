'use strict';

var fs    = require('fs');
var debug = require('debug')('datastore');

module.exports = function(baseDataDir) {
  if (!fs.existsSync(baseDataDir)) {
    fs.mkdirSync(baseDataDir);
  }

  function _isFolderExists(countryName) {
    var path = baseDataDir + '/' + countryName;
    return fs.existsSync(path);
  }

  function _isCountryFolderEmpty(countryName) {
    var isEmpty;
    var path = baseDataDir + '/' + countryName;
    var created = fs.existsSync(path);
    
    if (created) {
      isEmpty = fs.readdirSync(path).length > 0;
    } else {
      isEmpty = created;
    }
    return isEmpty;
  }

  function _createCountryFolder(countryName) {
    return fs.mkdirSync(baseDataDir + '/' + countryName);
  }

  function _createFiles(countryName, filename, data) {
    var path = baseDataDir + '/' + countryName + '/' + filename + '.json';
    return fs.writeFileSync(path, data);
  }

  return {
    existsFile: function(countryName, date) {

    },
    exists: function(countryName) {
      return _isCountryFolderEmpty(countryName);
    },
    create: function(countryName, filename, data) {
      if (!_isFolderExists(countryName)) {
        _createCountryFolder(countryName);
      }
      return _createFiles(countryName, filename, JSON.stringify(data, null, 2));
    },
    update: function() {

    },
    delete: function() {

    }
  };
};