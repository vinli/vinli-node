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

      expect(Vinli.Vehicle.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f')).to.be.rejectedWith('Not Found');
    });
  });

  describe('#trips()', function(){
    it('should exist', function(){
      var device = Vinli.Vehicle.forge('asfdafdasfdsdf');
      expect(device).to.have.property('trips').that.is.a('function');
    });
  });

  xdescribe('#collisions()', function(){
    it('should exist', function(){
      var device = Vinli.Vehicle.forge('asfdafdasfdsdf');
      expect(device).to.have.property('collisions').that.is.a('function');
    });
  });
});