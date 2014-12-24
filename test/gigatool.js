/*jshint expr: true*/
'use strict';

var chai = require('chai');
var proxyquire = require('proxyquire');
var sinonChai = require('sinon-chai');
var bluebird = require('bluebird');
var moment = require('moment');
var sinon = require('sinon');
var fs = require('fs');
var factory = require('autofixture');
var noop = require('lodash.noop');
var rimraf = require('rimraf');

var expect = chai.expect;
chai.use(sinonChai);

var dumbDir = '/',
  dumbSize = 1,
  dumbPage = 2;
var format = 'YYYY-MM-DD';

describe('Gigatools', function() {
  var gigatool;

  before(function() {
    gigatool = require('../lib/gigatool');
  });

  it('should be defined', function() {
    expect(gigatool).to.be.not.undefined;
  });
});

describe('Gigatools#Constructor', function() {
  var gigatool;
  before(function() {
    gigatool = proxyquire
      .load('../lib/gigatool', {
        './datastore': function(baseDir) {
          expect(baseDir).to.equal(dumbDir);
        },
        './countries': {
          getCountriesByType: function(datastore, size, page) {
            expect(size).to.equal(dumbSize);
            expect(page).to.equal(dumbPage);
          }
        }
      });
  });

  it('should be called with correct properties', function() {
    var gigatool = proxyquire
      .load('../lib/gigatool', {
        './countries': {
          getCountriesByType: function(datastore, size, page) {
            expect(size).to.equal(dumbSize);
            expect(page).to.equal(dumbPage);
          }
        }
      });
    gigatool(dumbSize, dumbPage, dumbDir);
  });

  it('should be initialize datastore', function() {
    var gigatool = proxyquire
      .load('../lib/gigatool', {
        './datastore': function(baseDir) {
          expect(baseDir).to.equal(dumbDir);
        },
        './countries': {
          getCountriesByType: noop
        }
      });
    gigatool(dumbSize, dumbPage, dumbDir);
  });
});

describe('Gigatools#clean', function() {
  var spy, gigatool;
  var start = moment();

  beforeEach(function() {
    spy = sinon.stub();

    gigatool = proxyquire
      .noCallThru()
      .load('../lib/gigatool', {
        './gigaapi': function() {
          return {
            countryByDates: spy
          };
        }
      });

    spy.returns(new bluebird.resolve([]));
  });

  it('should have called api to get events', function() {
    gigatool().clean(start.toDate());
    expect(spy).to.have.been.called;
  });

  it('should have called with 3 arguments', function() {
    gigatool().clean(start.toDate());
    expect(spy.args[0]).to.have.length(3);
  });

  it('should have called with date time passed', function() {
    gigatool().clean(start.toDate());
    var date = start.format(format);
    expect(spy.args[0][1]).to.equal(date);
  });

  it('should have called with default date', function() {
    gigatool().clean();
    var defaultDate = moment(['1970', '0', '01']).format(format);
    expect(spy.args[0][1]).to.equal(defaultDate);
  });
});

describe('Gigatools#integration', function() {
  var gigatool;
  var dataParentDir = './countries';
  var path = dataParentDir + '/Albania';
  var numberOfEventsFixture = 10,
    events;

  before(function() {
    factory.define('event', [
      'eventdate'.as(function() {
        return moment().format(format);
      }),
      'name',
      'showtime'.asDate(),
      'url',
      'url_tix',
      'event_owner',
      'follow_url',
      'event_image',
      'venue',
      'city',
      'country'.as(function() {
        return 'Albania';
      }),
      'state'
    ]);

    events = factory.createListOf('event', numberOfEventsFixture);
  });

  describe('#Clean', function() {
    var spy;
    describe('#Success', function() {
      before(function() {
        spy = sinon.stub();
        gigatool = proxyquire
          .noCallThru()
          .load('../lib/gigatool', {
            './gigaapi': function() {
              return {
                countryByDates: spy
              };
            }
          });

        spy.returns(new bluebird.resolve(events));
        gigatool().clean();
      });

      after(function(done) {
        rimraf(dataParentDir, done);
      });

      it('should have created the folder `Albania`', function() {
        expect(fs.existsSync(path)).to.be.true;
      });

      it('should have created a file for each `date`', function() {
        expect(fs.readdirSync(path)).to.have.length(1);
      });

      it('should have created parent folder', function() {
        expect(fs.existsSync(dataParentDir)).to.be.true;
      });
    });

    describe('#failure', function() {
      var debugSpy, errorMessage = 'api error';
      before(function() {
        spy = sinon.stub();
        debugSpy = sinon.stub();

        gigatool = proxyquire
          .noCallThru()
          .load('../lib/gigatool', {
            './gigaapi': function() {
              return {
                countryByDates: spy
              };
            },
            'debug': function() {
              return debugSpy;
            }
          });

        spy.returns(new bluebird.reject({
          stack: errorMessage
        }));
        gigatool().clean();
      });

      after(function(done) {
        rimraf(dataParentDir, done);
      });

      it('should have not created the folder `Albania`', function() {
        expect(fs.existsSync(path)).to.be.false;
      });

      it('should have created parent folder', function() {
        expect(fs.existsSync(dataParentDir)).to.be.true;
      });

      it('should have log error stack', function() {
        expect(debugSpy).to.have.been.called;
        expect(debugSpy).to.have.been.calledWith(errorMessage);
      });
    });
  });

  describe('#Continuous', function() {
    var spy;

    describe('#Success', function() {
      before(function() {
        spy = sinon.stub();
        gigatool = proxyquire
          .noCallThru()
          .load('../lib/gigatool', {
            './gigaapi': function() {
              return {
                country: spy
              };
            }
          });

        spy.returns(new bluebird.resolve(events));
        gigatool().continuous();
      });

      after(function(done) {
        rimraf(dataParentDir, done);
      });

      it('should have called api to get list of events', function() {
        expect(spy).to.have.been.called;
      });

      it('should have created the folder `Albania`', function() {
        expect(fs.existsSync(path)).to.be.true;
      });

      it('should have created a file for each `date`', function() {
        expect(fs.readdirSync(path)).to.have.length(1);
      });

      it('should have created parent folder', function() {
        expect(fs.existsSync(dataParentDir)).to.be.true;
      });
    });

    describe('#failure', function() {
      var debugSpy, errorMessage = 'api error';
      before(function() {
        spy = sinon.stub();
        debugSpy = sinon.stub();

        gigatool = proxyquire
          .noCallThru()
          .load('../lib/gigatool', {
            './gigaapi': function() {
              return {
                country: spy
              };
            },
            'debug': function() {
              return debugSpy;
            }
          });

        spy.returns(new bluebird.reject({
          stack: errorMessage
        }));
        gigatool().continuous();
      });

      after(function(done) {
        rimraf(dataParentDir, done);
      });

      it('should have not created the folder `Albania`', function() {
        expect(fs.existsSync(path)).to.be.false;
      });

      it('should have created parent folder', function() {
        expect(fs.existsSync(dataParentDir)).to.be.true;
      });

      it('should have log error stack', function() {
        expect(debugSpy).to.have.been.called;
        expect(debugSpy).to.have.been.calledWith(errorMessage);
      });
    });
  });
});