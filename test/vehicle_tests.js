var nock = require('nock');
var expect = require('./helpers/test_helper');

var Vinli = require('..')({appId: 'foo', secretKey: 'bar'});

describe('Vehicle', function(){
  before(function(){
    Vinli = require('..')({appId: 'foo', secretKey: 'bar'});
  });

  beforeEach(function(){
    nock.disableNetConnect();
  });

  afterEach(function(){
    nock.cleanAll();
  });

  describe('.forge()', function(){
    it('should exist', function(){
      expect(Vinli.Vehicle).to.have.property('fetch').that.is.a('function');
    });

    it('should return a vehicle with the given id', function(){
      var vehicle = Vinli.Vehicle.forge('c4627b29-14bd-49c3-8e6a-1f857143039f');
      expect(vehicle).to.have.property('id', 'c4627b29-14bd-49c3-8e6a-1f857143039f');
    });
  });

  describe('.fetch()', function(){
    it('should exist', function(){
      expect(Vinli.Vehicle).to.have.property('forge').that.is.a('function');
    });

    it('should fetch an Vehicle with the given id from the platform', function(){
      var vehicleMock = nock('https://platform.vin.li')
        .get('/api/v1/vehicles/fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .reply(200, {
          vehicle: {
            'id': 'fc8bdd0c-5be3-46d5-8582-b5b54052eca2',
            'vin': '4T1BK46K57U123456',
            'make': 'Toyota',
            'model': 'Camry',
            'year': '2007',
            'trim': 'SE 4dr Sedan (3.5L 6cyl 6A)',
            'links': {
              'self': '/api/v1/vehicles/fc8bdd0c-5be3-46d5-8582-b5b54052eca2'
            }
          }
        });

      return Vinli.Vehicle.fetch('fc8bdd0c-5be3-46d5-8582-b5b54052eca2').then(function(vehicle){
        expect(vehicle).to.be.an.instanceOf(Vinli.Vehicle);
        expect(vehicle).to.have.property('id', 'fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
        expect(vehicle).to.have.property('year', '2007');
        vehicleMock.done();
      });
    });

    it('should reject a request for an unknown emergency contact', function(){
      nock('https://platform.vin.li')
        .get('/api/v1/vehicles/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(404, {message: 'Not found'});

      expect(Vinli.Vehicle.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f')).to.be.rejectedWith(/Not found/);
    });
  });

  describe('#trips()', function(){
    it('should exist', function(){
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('trips').that.is.a('function');
    });

    it('should return a list of trips for the device', function(){
      var m = nock('https://trips.vin.li/')
        .get('/api/v1/vehicles/530f2690-63c0-11e4-86d8-7f2f26e5461e/trips?offset=0&limit=2')
        .reply(200, {
          'trips': [{
            'id': 'cf9173fa-bbca-49bb-8297-a1a18586a8e7',
            'start': '2014-12-30T08:50:48.669Z',
            'stop': '2014-12-30T14:57:46.225Z',
            'status': 'complete',
            'vehicleId': '530f2690-63c0-11e4-86d8-7f2f26e5461e',
            'deviceId': 'c4627b29-14bd-49c3-8e6a-1f857143039f'
          },{
            'id': '4cb2a8ea-64a5-49b9-bdb2-e60106f61f84',
            'start': '2014-12-29T13:35:52.184Z',
            'stop': '2014-12-29T13:58:32.270Z',
            'status': 'complete',
            'vehicleId': '530f2690-63c0-11e4-86d8-7f2f26e5461e',
            'deviceId': 'c4627b29-14bd-49c3-8e6a-1f857143039f'
          }],
            'meta': {
            'pagination': {
              'total': 748,
              'limit': 2,
              'offset': 0,
              'links': {
                'first': 'http://trips-test.vin.li/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/trips?offset=0&limit=2',
                'last': 'http://trips-test.vin.li/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/trips?offset=746&limit=2',
                'next': 'http://trips-test.vin.li/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/trips?offset=2&limit=2'
              }
            }
          }
        });

      return Vinli.Vehicle.forge('530f2690-63c0-11e4-86d8-7f2f26e5461e').trips({limit: 2}).then(function(trips){
        expect(trips).to.have.property('list').that.is.an('array');
        expect(trips.list).to.have.lengthOf(2);
        expect(trips.list[0]).to.be.instanceOf(Vinli.Trip);
        expect(trips).to.have.property('total', 748);
        expect(trips).to.have.property('next').that.is.a('function');

        m.done();
      });
    });
  });

  xdescribe('#collisions()', function(){
    it('should exist', function(){
      var device = Vinli.Vehicle.forge('asfdafdasfdsdf');
      expect(device).to.have.property('collisions').that.is.a('function');
    });
  });
});