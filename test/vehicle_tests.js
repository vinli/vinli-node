var nock = require('nock');
var expect = require('./helpers/test_helper');

var Vinli;

describe('Vehicle', function() {
  before(function() {
    Vinli = new (require('..'))({ appId: 'foo', secretKey: 'bar' });
  });

  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
  });

  describe('.forge()', function() {
    it('should exist', function() {
      expect(Vinli.Vehicle).to.have.property('fetch').that.is.a('function');
    });

    it('should return a vehicle with the given id', function() {
      var vehicle = Vinli.Vehicle.forge('c4627b29-14bd-49c3-8e6a-1f857143039f');
      expect(vehicle).to.have.property('id', 'c4627b29-14bd-49c3-8e6a-1f857143039f');
    });
  });

  describe('.fetch()', function() {
    it('should exist', function() {
      expect(Vinli.Vehicle).to.have.property('forge').that.is.a('function');
    });

    it('should fetch an Vehicle with the given id from the platform', function() {
      var vehicleMock = nock('https://platform.vin.li')
        .get('/api/v1/vehicles/fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .reply(200, {
          vehicle: {
            id: 'fc8bdd0c-5be3-46d5-8582-b5b54052eca2',
            vin: '4T1BK46K57U123456',
            make: 'Toyota',
            model: 'Camry',
            year: '2007',
            trim: 'SE 4dr Sedan (3.5L 6cyl 6A)',
            links: {
              self: '/api/v1/vehicles/fc8bdd0c-5be3-46d5-8582-b5b54052eca2'
            }
          }
        });

      return Vinli.Vehicle.fetch('fc8bdd0c-5be3-46d5-8582-b5b54052eca2').then(function(vehicle) {
        expect(vehicle).to.be.an.instanceOf(Vinli.Vehicle);
        expect(vehicle).to.have.property('id', 'fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
        expect(vehicle).to.have.property('year', '2007');
        vehicleMock.done();
      });
    });

    it('should reject a request for an unknown emergency contact', function() {
      nock('https://platform.vin.li')
        .get('/api/v1/vehicles/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(404, { message: 'Not found' });

      expect(Vinli.Vehicle.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f')).to.be.rejectedWith(/Not found/);
    });
  });

  describe('#trips()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('trips').that.is.a('function');
    });

    it('should return a list of trips for the vehicle', function() {
      var m = nock('https://trips.vin.li')
        .get('/api/v1/vehicles/530f2690-63c0-11e4-86d8-7f2f26e5461e/trips?limit=2')
        .reply(200, {
          trips: [{
            id: 'cf9173fa-bbca-49bb-8297-a1a18586a8e7',
            start: '2014-12-30T08:50:48.669Z',
            stop: '2014-12-30T14:57:46.225Z',
            status: 'complete',
            vehicleId: '530f2690-63c0-11e4-86d8-7f2f26e5461e',
            deviceId: 'c4627b29-14bd-49c3-8e6a-1f857143039f'
          }, {
            id: '4cb2a8ea-64a5-49b9-bdb2-e60106f61f84',
            start: '2014-12-29T13:35:52.184Z',
            stop: '2014-12-29T13:58:32.270Z',
            status: 'complete',
            vehicleId: '530f2690-63c0-11e4-86d8-7f2f26e5461e',
            deviceId: 'c4627b29-14bd-49c3-8e6a-1f857143039f'
          }],
            meta: {
            pagination: {
              remaining: 0,
              until: '2015-07-24T22:11:23.829Z',
              since: '1970-01-01T00:00:00.000Z',
              limit: 2,
              sortDir: 'desc',
              links: {
                prior: 'https://trips.vin.li/api/v1/vehicles/530f2690-63c0-11e4-86d8-7f2f26e5461e/trips?limit=2&until=1437778166267'
              }
            }
          }
        });

      return Vinli.Vehicle.forge('530f2690-63c0-11e4-86d8-7f2f26e5461e').trips({ limit: 2 }).then(function(trips) {
        expect(trips).to.have.property('list').that.is.an('array');
        expect(trips.list).to.have.lengthOf(2);
        expect(trips.list[0]).to.be.instanceOf(Vinli.Trip);
        expect(trips).to.have.property('prior').that.is.a('function');

        m.done();
      });
    });
  });

  describe('#reportCards()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('reportCards').that.is.a('function');
    });

    it('should return a list of report cards for the vehicle', function() {
      var m = nock('https://behavioral.vin.li')
        .get('/api/v1/vehicles/ca10cd7a-d2a5-4bb3-b47b-2aa0b8848f55/report_cards?limit=2')
        .reply(200, {
          reportCards: [
          {
            id: '1eeda86c-0ae2-48e3-b589-792e2a1b0508',
            deviceId: '64013359-093a-4ed1-bd5f-cb47deaea262',
            vehicleId: 'ca10cd7a-d2a5-4bb3-b47b-2aa0b8848f55',
            tripId: 'eb8ef0f8-e90a-4b85-bd8b-b8323c5bcd58',
            grade: 'A',
            links: {
              self: 'https://behavioral-dev.vin.li/api/v1/report_cards/1eeda86c-0ae2-48e3-b589-792e2a1b0508',
              trip: 'https://trips-dev.vin.li/api/v1/trips/eb8ef0f8-e90a-4b85-bd8b-b8323c5bcd58',
              device: 'https://platform-dev.vin.li/api/v1/devices/64013359-093a-4ed1-bd5f-cb47deaea262',
              vehicle: 'https://platform-dev.vin.li/api/v1/vehicles/ca10cd7a-d2a5-4bb3-b47b-2aa0b8848f55'
            }
          },
          {
            id: '8d313cd0-1d40-4a82-9a9a-dcec71704e35',
            deviceId: '64013359-093a-4ed1-bd5f-cb47deaea262',
            vehicleId: 'ca10cd7a-d2a5-4bb3-b47b-2aa0b8848f55',
            tripId: '81c10254-e643-4a4a-93ee-f6ce3c1cdb84',
            grade: 'A',
            links: {
              self: 'https://behavioral-dev.vin.li/api/v1/report_cards/8d313cd0-1d40-4a82-9a9a-dcec71704e35',
              trip: 'https://trips-dev.vin.li/api/v1/trips/81c10254-e643-4a4a-93ee-f6ce3c1cdb84',
              device: 'https://platform-dev.vin.li/api/v1/devices/64013359-093a-4ed1-bd5f-cb47deaea262',
              vehicle: 'https://platform-dev.vin.li/api/v1/vehicles/ca10cd7a-d2a5-4bb3-b47b-2aa0b8848f55'
            }
          }
         ],
          meta: {
            pagination: {
              remaining: 0,
              until: '2015-08-11T22:42:36.591Z',
              since: '1970-01-01T00:00:00.000Z',
              limit: 2,
              sortDir: 'desc',
              links: {
                first: 'http://behavioral.vin.li/api/v1/devices/64013359-093a-4ed1-bd5f-cb47deaea262/report_cards?limit=2',
                last: 'http://behavioral.vin.li/api/v1/devices/64013359-093a-4ed1-bd5f-cb47deaea262/report_cards?limit=2',
                next: 'http://behavioral.vin.li/api/v1/devices/64013359-093a-4ed1-bd5f-cb47deaea262/report_cards?limit=2'
              }
            }
          }
        });

      return Vinli.Vehicle.forge('ca10cd7a-d2a5-4bb3-b47b-2aa0b8848f55').reportCards({ limit: 2 }).then(function(reportCards) {
        expect(reportCards).to.have.property('list').that.is.an('array');
        expect(reportCards.list).to.have.lengthOf(2);
        expect(reportCards.list[0]).to.be.instanceOf(Vinli.ReportCard);
        expect(reportCards).to.have.property('next').that.is.a('function');

        m.done();
      });
    });
  });

  describe('#codes()', function() {
    it('should exist', function() {
      var vehicle = Vinli.Vehicle.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
      expect(vehicle).to.have.property('codes').that.is.a('function');
    });

    it('should get a list of all diagnostic trouble codes', function() {
      var m = nock('https://diagnostic.vin.li')
        .get('/api/v1/vehicles/fc8bdd0c-5be3-46d5-8582-b5b54052eca2/codes?limit=3')
        .reply(200, {
          meta: {
            pagination: {
              remaining: 1,
              until: '2015-07-24T22:11:23.829Z',
              since: '1970-01-01T00:00:00.000Z',
              limit: 3,
              sortDir: 'desc',
              links: {
                prior: 'https://diagnostic.vin.li/api/v1/vehicles/fc8bdd0c-5be3-46d5-8582-b5b54052eca2/codes?limit=3&until=1437778166267'
              }
            }
          },
          codes: [{
            id: '61400110-aec8-4ed7-a3cb-1e47ce8f9fe1',
            codeId: 'P0100'
          }, {
            id: '9640294c-1fe5-4365-85a2-6b40378762b7',
            codeId: 'P0101'
          }, {
            id: 'd3d01d86-47a2-4ef9-926c-f69517c58fb9',
            codeId: 'P0102'
          }]
        });

      return Vinli.Vehicle.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .codes({ limit: 3 })
        .then(function(codes) {
          expect(codes).to.have.property('list').that.is.an('array');
          expect(codes.list).to.have.lengthOf(3);
          expect(codes.list[0]).to.be.an.instanceOf(Vinli.Code);
          expect(codes).to.have.property('prior').that.is.a('function');
          m.done();
        });
    });
  });

  describe('#activeCodes()', function() {
    it('should exist', function() {
      var vehicle = Vinli.Vehicle.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
      expect(vehicle).to.have.property('activeCodes').that.is.a('function');
    });

    it('should get a list of active diagnostic trouble codes', function() {
      var m = nock('https://diagnostic.vin.li')
        .get('/api/v1/vehicles/fc8bdd0c-5be3-46d5-8582-b5b54052eca2/codes?state=active&limit=3')
        .reply(200, {
          meta: {
            pagination: {
              remaining: 1,
              until: '2015-07-24T22:11:23.829Z',
              since: '1970-01-01T00:00:00.000Z',
              limit: 3,
              sortDir: 'desc',
              links: {
                prior: 'https://diagnostic.vin.li/api/v1/vehicles/fc8bdd0c-5be3-46d5-8582-b5b54052eca2/codes?state=active&limit=3&until=1437778166267'
              }
            }
          },
          codes: [{
            id: '61400110-aec8-4ed7-a3cb-1e47ce8f9fe1',
            codeId: 'P0100'
          }, {
            id: '9640294c-1fe5-4365-85a2-6b40378762b7',
            codeId: 'P0101'
          }, {
            id: 'd3d01d86-47a2-4ef9-926c-f69517c58fb9',
            codeId: 'P0102'
          }]
        });

      return Vinli.Vehicle.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .activeCodes({ limit: 3 })
        .then(function(codes) {
          expect(codes).to.have.property('list').that.is.an('array');
          expect(codes.list).to.have.lengthOf(3);
          expect(codes.list[0]).to.be.an.instanceOf(Vinli.Code);
          expect(codes).to.have.property('prior').that.is.a('function');
          m.done();
        });
    });
  });

  describe('#inactiveCodes()', function() {
    it('should exist', function() {
      var vehicle = Vinli.Vehicle.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
      expect(vehicle).to.have.property('inactiveCodes').that.is.a('function');
    });

    it('should get a list of inactive diagnostic trouble codes', function() {
      var m = nock('https://diagnostic.vin.li')
        .get('/api/v1/vehicles/fc8bdd0c-5be3-46d5-8582-b5b54052eca2/codes?state=inactive&limit=3')
        .reply(200, {
          meta: {
            pagination: {
              remaining: 1,
              until: '2015-07-24T22:11:23.829Z',
              since: '1970-01-01T00:00:00.000Z',
              limit: 3,
              sortDir: 'desc',
              links: {
                prior: 'https://diagnostic.vin.li/api/v1/vehicles/fc8bdd0c-5be3-46d5-8582-b5b54052eca2/codes?state=inactivelimit=3&until=1437778166267'
              }
            }
          },
          codes: [{
            id: '61400110-aec8-4ed7-a3cb-1e47ce8f9fe1',
            codeId: 'P0100'
          }, {
            id: '9640294c-1fe5-4365-85a2-6b40378762b7',
            codeId: 'P0101'
          }, {
            id: 'd3d01d86-47a2-4ef9-926c-f69517c58fb9',
            codeId: 'P0102'
          }]
        });

      return Vinli.Vehicle.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .inactiveCodes({ limit: 3 })
        .then(function(codes) {
          expect(codes).to.have.property('list').that.is.an('array');
          expect(codes.list).to.have.lengthOf(3);
          expect(codes.list[0]).to.be.an.instanceOf(Vinli.Code);
          expect(codes).to.have.property('prior').that.is.a('function');
          m.done();
        });
    });
  });

  describe('#collisions()', function() {
    it('should exist', function() {
      var vehicle = Vinli.Vehicle.forge('asfdafdasfdsdf');
      expect(vehicle).to.have.property('collisions').that.is.a('function');
    });

    it('should return a list of collisions for the devices', function() {
      var m = nock('https://safety.vin.li')
        .get('/api/v1/vehicles/c4627b29-14bd-49c3-8e6a-1f857143039f/collisions?limit=2')
        .reply(200, {
          collisions: [{
            id: '06782175-735e-4226-82bc-ebdf887c30f3',
            timestamp: '2015-07-13T17:45:04.583Z',
            location: {
              type: 'Point',
              coordinates: [ -96.917009, 32.766392 ]
            },
            links: { self: 'https://safety.vin.li/api/v1/collisions/06782175-735e-4226-82bc-ebdf887c30f3' }
          }, {
            id: '5b2bf92c-a2c5-4365-9f9b-3d51b8883ad6',
            timestamp: '2015-07-13T17:46:04.583Z',
            location: {
              type: 'Point',
              coordinates: [ -96.917009, 32.766392 ]
            },
            links: { self: 'https://safety.vin.li/api/v1/collisions/5b2bf92c-a2c5-4365-9f9b-3d51b8883ad6' }
          }],
          meta: {
            pagination: {
              remaining: 1,
              until: '2015-07-24T22:11:23.829Z',
              since: '1970-01-01T00:00:00.000Z',
              limit: 2,
              sortDir: 'desc',
              links: {
                prior: 'https://safety.vin.li/api/v1/vehicles/c4627b29-14bd-49c3-8e6a-1f857143039f/collisions?limit=2&until=1437778166267'
              }
            }
          }
        });

      return Vinli.Vehicle.forge('c4627b29-14bd-49c3-8e6a-1f857143039f').collisions({ limit: 2 })
        .then(function(collisions) {
          expect(collisions).to.have.property('list').that.is.an('array');
          expect(collisions.list).to.have.lengthOf(2);
          expect(collisions.list[0]).to.be.instanceOf(Vinli.Collision);
          expect(collisions).to.have.property('prior').that.is.a('function');

          m.done();
        });
    });
  });
});
