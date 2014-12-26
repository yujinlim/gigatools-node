/*jshint expr: true*/
'use strict';

var chai = require('chai');
var proxyquire = require('proxyquire').noPreserveCache();
var sinonChai = require('sinon-chai');
var bluebird = require('bluebird');
var moment = require('moment');
var sinon = require('sinon');
var fs = require('fs');
var factory = require('autofixture');
var rimraf = require('rimraf');

var expect = chai.expect;
chai.use(sinonChai);

var dumbDir = '/',
  dumbSize = 10,
  dumbCountries = ['Albania'],
  dumbPage = 1;
var format = 'YYYY-MM-DD';

describe('Gigatools#Constructor', function() {
  this.timeout(5000);
  it('should be called with correct properties', function(done) {
    var gigatool = proxyquire
      .load('../lib/gigatool', {
        './countries': {
          getCountriesByType: function(datastore, size, page) {
            expect(size).to.equal(dumbSize);
            expect(page).to.equal(dumbPage);
            done();
            return dumbCountries;
          }
        }
      });
    gigatool(dumbSize, dumbPage, dumbDir);
  });

  it('should be initialize datastore', function(done) {
    var gigatool = proxyquire
      .load('../lib/gigatool', {
        './datastore': function(baseDir) {
          expect(baseDir).to.equal(dumbDir);
          done();
        },
        './countries': {
          getCountriesByType: function() {
            return dumbCountries;
          }
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
    gigatool(dumbSize, dumbPage).clean(start.toDate());
    expect(spy).to.have.been.called;
  });

  it('should have called with 3 arguments', function() {
    gigatool(dumbSize, dumbPage).clean(start.toDate());
    expect(spy.args[0]).to.have.length(3);
  });

  it('should have called with date time passed', function() {
    gigatool(dumbSize, dumbPage).clean(start.toDate());
    var date = start.format(format);
    expect(spy.args[0][1]).to.equal(date);
  });

  it('should have called with default date', function() {
    gigatool(dumbSize, dumbPage).clean();
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
        gigatool(dumbSize, dumbPage).clean();
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
        gigatool(dumbPage, dumbSize).clean();
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
        gigatool(dumbPage, dumbSize).continuous();
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
        gigatool(dumbPage, dumbSize).continuous();
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