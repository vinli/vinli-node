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

  describe('#odometers()', function() {
    it('should exist', function() {
      var vehicle = Vinli.Vehicle.forge('asfdafdasfdsdf');
      expect(vehicle).to.have.property('odometers').that.is.a('function');
    });

    it('should return a list of odometers for the vehicle', function() {
      var m = nock('https://distance.vin.li')
        .get('/api/v1/vehicles/0e14f2db-ff0b-43bd-b88c-01b9f226778f/odometers?limit=2')
        .reply(200, {
          odometers: [
            {
              id: 'bcdc8734-ce79-4d78-a911-f77c09316f5f',
              vehicleId: '0e14f2db-ff0b-43bd-b88c-01b9f226778f',
              reading: 83321969.16,
              date: '2016-03-03T20:23:53.726Z',
              links: {
                vehicle: 'https://platform-dev.vin.li/api/v1/vehicles/0e14f2db-ff0b-43bd-b88c-01b9f226778f'
              }
            },
            {
              id: '428eb67d-bcc5-4870-8bab-96abb30aaaf2',
              vehicleId: '0e14f2db-ff0b-43bd-b88c-01b9f226778f',
              reading: 83307485.1,
              date: '2016-03-02T16:33:48.780Z',
              links: {
                vehicle: 'https://platform-dev.vin.li/api/v1/vehicles/0e14f2db-ff0b-43bd-b88c-01b9f226778f'
              }
            }
          ],
          meta: {
            pagination: {
              remaining: 2,
              until: '2016-03-09T18:07:16.150Z',
              since: '1970-01-01T00:00:00.000Z',
              limit: 2,
              sortDir: 'desc',
              links: {
                prior: 'https://distance-dev.vin.li/api/v1/vehicles/0e14f2db-ff0b-43bd-b88c-01b9f226778f/odometers?limit=2&until=1456936428779'
              }
            }
          }
        });

      return Vinli.Vehicle.forge('0e14f2db-ff0b-43bd-b88c-01b9f226778f').odometers({ limit: 2 })
        .then(function(odometers) {
          expect(odometers).to.have.property('list').that.is.an('array');
          expect(odometers.list).to.have.lengthOf(2);
          expect(odometers.list[0]).to.be.instanceOf(Vinli.Odometer);
          expect(odometers).to.have.property('prior').that.is.a('function');

          m.done();
        });
    });
  });

  describe('#setOdometer()', function() {
    it('should exist', function() {
      var vehicle = Vinli.Vehicle.forge('asfdafdasfdsdf');
      expect(vehicle).to.have.property('setOdometer').that.is.a('function');
    });

    it('should return an Odometer object', function() {
      var odo = {
        reading: 5000,
        unit: 'km'
      };

      var m = nock('https://distance.vin.li')
        .post('/api/v1/vehicles/78809613-7d24-40d6-a76b-a4bc8af3a181/odometers', {
          odometer: odo
        }).reply(201, {
          odometer: {
            id: 'f5726b65-cc57-4f19-aec5-8abd77bbb814',
            vehicleId: '78809613-7d24-40d6-a76b-a4bc8af3a181',
            reading: 5000,
            date: '2015-12-02T16:02:37.315Z',
            links: {
              vehicle: 'https://platform-dev.vin.li/api/v1/vehicles/0e14f2db-ff0b-43bd-b88c-01b9f226778f'
            }
          }
        });

      return Vinli.Vehicle.forge('78809613-7d24-40d6-a76b-a4bc8af3a181').setOdometer(odo)
        .then(function(odometer) {
          expect(odometer).to.be.an.instanceOf(Vinli.Odometer);
          expect(odometer).to.have.property('id').that.is.a('string');
          expect(odometer).to.have.property('vehicleId', '78809613-7d24-40d6-a76b-a4bc8af3a181');
          expect(odometer).to.have.property('reading', 5000);
          expect(odometer).to.have.property('date').that.is.a('string');
          expect(odometer).to.have.property('links').that.is.an('object');

          m.done();
        });
    });
  });

  describe('#odometerTriggers()', function() {
    it('should exist', function() {
      var vehicle = Vinli.Vehicle.forge('asfdafdasfdsdf');
      expect(vehicle).to.have.property('odometerTriggers').that.is.a('function');
    });

    it('should return a list of odometerTriggers for the vehicle', function() {
      var m = nock('https://distance.vin.li')
        .get('/api/v1/vehicles/0e14f2db-ff0b-43bd-b88c-01b9f226778f/odometer_triggers')
        .reply(200, {
          odometerTriggers: [
            {
              id: 'bcdc8734-ce79-4d78-a911-f77c09316f5f',
              vehicleId: '0e14f2db-ff0b-43bd-b88c-01b9f226778f',
              type: 'specific',
              threshold: 83321969.16,
              events: 0,
              links: {
                vehicle: 'https://platform-dev.vin.li/api/v1/vehicles/0e14f2db-ff0b-43bd-b88c-01b9f226778f'
              }
            },
            {
              id: '428eb67d-bcc5-4870-8bab-96abb30aaaf2',
              vehicleId: '0e14f2db-ff0b-43bd-b88c-01b9f226778f',
              type: 'from_now',
              threshold: 5000,
              events: 0,
              links: {
                vehicle: 'https://platform-dev.vin.li/api/v1/vehicles/0e14f2db-ff0b-43bd-b88c-01b9f226778f'
              }
            }
          ],
          meta: {
            pagination: {
              remaining: 2,
              until: '2016-03-09T18:07:16.150Z',
              since: '1970-01-01T00:00:00.000Z',
              limit: 2,
              sortDir: 'desc',
              links: {
                prior: 'https://distance-dev.vin.li/api/v1/vehicles/0e14f2db-ff0b-43bd-b88c-01b9f226778f/odometer_triggers?&until=1456936428779'
              }
            }
          }
        });

      return Vinli.Vehicle.forge('0e14f2db-ff0b-43bd-b88c-01b9f226778f').odometerTriggers()
        .then(function(triggers) {
          expect(triggers).to.have.property('list').that.is.an('array');
          expect(triggers.list).to.have.lengthOf(2);
          expect(triggers.list[0]).to.be.instanceOf(Vinli.OdometerTrigger);

          m.done();
        });
    });
  });

  describe('#setOdometerTrigger()', function() {
    it('should exist', function() {
      var vehicle = Vinli.Vehicle.forge('asfdafdasfdsdf');
      expect(vehicle).to.have.property('setOdometerTrigger').that.is.a('function');
    });

    it('should return an OdometerTrigger object', function() {
      var trig = {
        threshold: 5000,
        type: 'from_now',
        unit: 'km'
      };

      var m = nock('https://distance.vin.li')
        .post('/api/v1/vehicles/78809613-7d24-40d6-a76b-a4bc8af3a181/odometer_triggers', {
          odometerTrigger: trig
        }).reply(201, {
          odometerTrigger: {
            id: 'f5726b65-cc57-4f19-aec5-8abd77bbb814',
            vehicleId: '78809613-7d24-40d6-a76b-a4bc8af3a181',
            threshold: 5000,
            type: 'from_now',
            events: 0,
            links: {
              vehicle: 'https://platform-dev.vin.li/api/v1/vehicles/0e14f2db-ff0b-43bd-b88c-01b9f226778f'
            }
          }
        });

      return Vinli.Vehicle.forge('78809613-7d24-40d6-a76b-a4bc8af3a181').setOdometerTrigger(trig)
        .then(function(trigger) {
          expect(trigger).to.be.an.instanceOf(Vinli.OdometerTrigger);
          expect(trigger).to.have.property('id').that.is.a('string');
          expect(trigger).to.have.property('vehicleId', '78809613-7d24-40d6-a76b-a4bc8af3a181');
          expect(trigger).to.have.property('threshold', 5000);
          expect(trigger).to.have.property('type', 'from_now');
          expect(trigger).to.have.property('events', 0);
          expect(trigger).to.have.property('links').that.is.an('object');

          m.done();
        });
    });
  });

  describe('#distances()', function() {
    it('should exist', function() {
      var vehicle = Vinli.Vehicle.forge('asfdafdasfdsdf');
      expect(vehicle).to.have.property('distances').that.is.a('function');
    });

    it('should return an array of distances', function() {
      var m = nock('https://distance.vin.li', { reqHeaders: { 'x-vinli-unit': 'mi' } })
        .get('/api/v1/vehicles/78809613-7d24-40d6-a76b-a4bc8af3a181/distances')
        .reply(200, {
          distances: [
            {
              confidenceMin: 3628.139,
              confidenceMax: 100032.986,
              value: 51830.563,
              lastOdometerDate: '2016-03-03T20:23:53.726Z'
            },
            {
              confidenceMin: 51831.166,
              confidenceMax: 51832.409,
              value: 51831.788,
              lastOdometerDate: '2016-03-03T20:23:53.726Z'
            }
          ]
        });

      return Vinli.Vehicle.forge('78809613-7d24-40d6-a76b-a4bc8af3a181').distances({ unit: 'mi' })
        .then(function(distances) {
          expect(distances).to.be.an('array').that.has.length(2);
          expect(distances[0]).to.be.an('object');
          expect(distances[0]).to.have.property('confidenceMin');
          expect(distances[0]).to.have.property('confidenceMax');
          expect(distances[0]).to.have.property('value');
          expect(distances[0]).to.have.property('lastOdometerDate');

          m.done();
        });
    });
  });

  describe('#bestDistance()', function() {
    it('should exist', function() {
      var vehicle = Vinli.Vehicle.forge('asfdafdasfdsdf');
      expect(vehicle).to.have.property('bestDistance').that.is.a('function');
    });

    it('should return a distance', function() {
      var m = nock('https://distance.vin.li', { reqHeaders: { 'x-vinli-unit': 'mi' } })
        .get('/api/v1/vehicles/78809613-7d24-40d6-a76b-a4bc8af3a181/distances/_best')
        .reply(200, {
          distance: {
              confidenceMin: 51831.166,
              confidenceMax: 51832.409,
              value: 51831.788,
              lastOdometerDate: '2016-03-03T20:23:53.726Z'
            }
        });

      return Vinli.Vehicle.forge('78809613-7d24-40d6-a76b-a4bc8af3a181').bestDistance({ unit: 'mi' })
        .then(function(distance) {
          expect(distance).to.be.an('object');
          expect(distance).to.have.property('confidenceMin');
          expect(distance).to.have.property('confidenceMax');
          expect(distance).to.have.property('value');
          expect(distance).to.have.property('lastOdometerDate');

          m.done();
        });
    });
  });
});
