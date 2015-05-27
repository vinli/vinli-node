var nock = require('nock');
var expect = require('./helpers/test_helper');

var Vinli = require('..')({appId: 'foo', secretKey: 'bar'});

describe('Trip', function(){
  before(function(){
    Vinli = new (require('..'))({appId: 'foo', secretKey: 'bar' });
  });

  beforeEach(function(){
    nock.disableNetConnect();
  });

  afterEach(function(){
    nock.cleanAll();
  });

  describe('.forge()', function(){
    it('should exist', function(){
      expect(Vinli.Trip).to.have.property('fetch').that.is.a('function');
    });

    it('should return a trip with the given id', function(){
      var trip = Vinli.Trip.forge('c4627b29-14bd-49c3-8e6a-1f857143039f');
      expect(trip).to.have.property('id', 'c4627b29-14bd-49c3-8e6a-1f857143039f');
    });
  });

  describe('.fetch()', function(){
    it('should exist', function(){
      expect(Vinli.Trip).to.have.property('forge').that.is.a('function');
    });

    it('should fetch an trip with the given id from the platform', function(){
      var m = nock('https://trips.vin.li')
        .get('/api/v1/trips/cf9173fa-bbca-49bb-8297-a1a18586a8e7')
        .reply(200, {
          trip: {
            id: 'cf9173fa-bbca-49bb-8297-a1a18586a8e7',
            start: '2014-12-30T14:50:48.669Z',
            stop: '2014-12-30T08:57:46.225Z',
            status: 'complete',
            vehicleId: '530f2690-63c0-11e4-86d8-7f2f26e5461e',
            deviceId: 'fc8bdd0c-5be3-46d5-8582-b5b54052eca2',
          }
        });

      return Vinli.Trip.fetch('cf9173fa-bbca-49bb-8297-a1a18586a8e7').then(function(trip){
        expect(trip).to.be.an.instanceOf(Vinli.Trip);
        expect(trip).to.have.property('id', 'cf9173fa-bbca-49bb-8297-a1a18586a8e7');
        m.done();
      });
    });

    it('should reject a request for an unknown trip', function(){
      nock('https://trips.vin.li')
        .get('/api/v1/trips/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(404, {message: 'Not found'});

      expect(Vinli.Trip.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f')).to.be.rejectedWith(/Not found/);
    });
  });

  xdescribe('#messages()', function(){
    it('should exist', function(){
      var trip = Vinli.Trip.forge('asfdafdasfdsdf');
      expect(trip).to.have.property('messages').that.is.a('function');
    });
  });

  describe('#locations()', function(){
    it('should exist', function(){
      var trip = Vinli.Trip.forge('asfdafdasfdsdf');
      expect(trip).to.have.property('locations').that.is.a('function');
    });
  });

  xdescribe('#snapshots()', function(){
    it('should exist', function(){
      var trip = Vinli.Trip.forge('asfdafdasfdsdf');
      expect(trip).to.have.property('snapshots').that.is.a('function');
    });
  });
});