var nock = require('nock');
var expect = require('./helpers/test_helper');

var Vinli;

describe('Odometer', function() {
  before(function() {
    Vinli = new (require('..'))({ appId: 'foo', secretKey: 'bar' });
  });

  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
  });

  describe('.forge(id)', function() {
    it('should exist', function() {
      expect(Vinli.Odometer).to.have.property('forge').that.is.a('function');
    });

    it('should return an Odometer with the given id', function() {
      var odometer = Vinli.Odometer.forge('a095ae10-6e1f-4d46-a56f-b1855573e9cb');
      expect(odometer).to.have.property('id', 'a095ae10-6e1f-4d46-a56f-b1855573e9cb');
    });
  });

  describe('.fetch()', function() {
    it('should exist', function() {
      expect(Vinli.Odometer).to.have.property('fetch').that.is.a('function');
    });

    it('should fetch an odometer given the id', function() {
      var odometerId = 'c4150a36-4f52-4894-8a36-ac413861d657';
      var odometerNock = nock('https://distance.vin.li')
        .get('/api/v1/odometers/' + odometerId)
        .reply(200, {
          odometer: {
            id: odometerId,
            vehicleId: '0e14f2db-ff0b-43bd-b88c-01b9f226778f',
            reading: 83321969.16,
            date: '2016-03-03T20:23:53.726Z',
            links: {
              vehicle: 'https://platform-dev.vin.li/api/v1/vehicles/0e14f2db-ff0b-43bd-b88c-01b9f226778f'
            }
          }
        });

      return Vinli.Odometer.fetch(odometerId).then(function(odometer) {
        expect(odometer).to.be.an.instanceOf(Vinli.Odometer);
        expect(odometer).to.have.property('id', odometerId);
        expect(odometer).to.have.property('vehicleId');
        expect(odometer).to.have.property('reading');
        expect(odometer).to.have.property('date');
        odometerNock.done();
      });
    });

    it('should not fetch an unknown odometer', function() {
      nock('https://distance.vin.li')
        .get('/api/v1/odometers/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(404, { message: 'Not found' });

      expect(Vinli.Odometer.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f')).to.be.rejectedWith(/Not found/);
    });
  });

  describe('#delete()', function() {
    it('should exist', function() {
      var odometer = Vinli.Odometer.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
      expect(odometer).to.have.property('delete').that.is.a('function');
    });

    it('should delete the odometer', function() {
      var m = nock('https://distance.vin.li')
        .delete('/api/v1/odometers/fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .reply(204);

      return Vinli.Odometer.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2').delete().then(function() {
        m.done();
      });
    });
  });
});
