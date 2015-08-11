var nock = require('nock');
var expect = require('./helpers/test_helper');

var Vinli;

describe('Device', function() {
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
      expect(Vinli.Device).to.have.property('fetch').that.is.a('function');
    });

    it('should return a device with the given id', function() {
      var device = Vinli.Device.forge('c4627b29-14bd-49c3-8e6a-1f857143039f');
      expect(device).to.have.property('id', 'c4627b29-14bd-49c3-8e6a-1f857143039f');
    });
  });

  describe('.fetch()', function() {
    it('should exist', function() {
      expect(Vinli.Device).to.have.property('forge').that.is.a('function');
    });

    it('should fetch a device with the given id from the platform', function() {
      var deviceNock = nock('https://platform.vin.li')
        .get('/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(200, { device: { id: 'c4627b29-14bd-49c3-8e6a-1f857143039f', chipId: 'AF3242dsfeD' } });

      return Vinli.Device.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f').then(function(device) {
        expect(device).to.have.property('id', 'c4627b29-14bd-49c3-8e6a-1f857143039f');
        expect(device).to.have.property('chipId', 'AF3242dsfeD');
        deviceNock.done();
      });
    });

    it('should reject a request for an unknown device', function() {
      nock('https://platform.vin.li')
        .get('/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(404, { message: 'Not found' });

      expect(Vinli.Device.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f')).to.be.rejectedWith(/Not found/);
    });
  });

  describe('#vehicles()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('vehicles').that.is.a('function');
    });

    it('should return a list of vehicles', function() {
      var m = nock('https://platform.vin.li')
        .get('/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/vehicles?offset=0&limit=3')
        .reply(200, {
          meta: {
            pagination: {
              total: 4,
              limit: 3,
              offset: 0,
              links: {
                first: '/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/vehicles?limit=3&offset=0&sortDirection=desc',
                next: '/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/vehicles?limit=3&offset=3&sortDirection=desc',
                last: '/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/vehicles?limit=3&offset=3&sortDirection=desc'
              }
            }
          },
          vehicles: [{
            id: '530f2690-63c0-11e4-86d8-7f2f26e5461e',
            vin: '4T1BK46K57U571847',
            make: 'Toyota',
            model: 'Camry',
            year: '2007',
            trim: 'SE 4dr Sedan (3.5L 6cyl 6A)'
          }, {
            id: 'da2d2900-442c-11e4-8f53-f5189366402a',
            vin: '1G1JC5444R7556142',
            make: 'Chevrolet',
            model: 'Cavalier',
            year: '1994',
            trim: 'RS 4dr Sedan'
          }, {
            id: '0d7b4950-44f4-11e4-8f53-f5189366402a',
            vin: 'JM1BL1SF1A1168829'
          }]
        });

      return Vinli.Device.forge('c4627b29-14bd-49c3-8e6a-1f857143039f').vehicles({ limit: 3 }).then(function(vehicles) {
        expect(vehicles).to.have.property('list').that.is.an('array');
        expect(vehicles.list).to.have.lengthOf(3);
        expect(vehicles.list[0]).to.be.instanceOf(Vinli.Vehicle);
        expect(vehicles).to.have.property('total', 4);
        expect(vehicles).to.have.property('next').that.is.a('function');
        m.done();
      });
    });
  });

  describe('#latestVehicle()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('latestVehicle').that.is.a('function');
    });

    it('should return a Vehicle object', function() {
      var m = nock('https://platform.vin.li')
        .get('/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/vehicles/_latest')
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

      return Vinli.Device.forge('c4627b29-14bd-49c3-8e6a-1f857143039f').latestVehicle().then(function(vehicle) {
        expect(vehicle).to.be.an.instanceOf(Vinli.Vehicle);
        expect(vehicle).to.have.property('vin', '4T1BK46K57U123456');
        m.done();
      });
    });

    it('should return null for a device that has not had a vehicle yet', function() {
      var m = nock('https://platform.vin.li')
        .get('/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/vehicles/_latest')
        .reply(200, { vehicle: null });

      return Vinli.Device.forge('c4627b29-14bd-49c3-8e6a-1f857143039f').latestVehicle().then(function(vehicle) {
        expect(vehicle).to.equal(null);
        m.done();
      });
    });
  });

  xdescribe('#startups()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('startups').that.is.a('function');
    });
  });

  xdescribe('#shutdowns()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('shutdowns').that.is.a('function');
    });
  });

  describe('#messages()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('messages').that.is.a('function');
    });

    it('should return a list of messages', function() {
      var m = nock('https://telemetry.vin.li')
        .get('/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/messages?limit=3')
        .reply(200, {
        messages: [{
          id: '4993fac7-7e0b-4d90-9e57-af8eb1d27170',
          timestamp: 1416841046851,
          location: {
              type: 'point',
              coordinates: [
                    -96.79064822,
                    32.78053848
                ]
            },
          calculatedLoadValue: 31.372549019607842,
          vehicleSpeed: 3,
          rpm: 672.5
          }, {
          id: '26f7b270-e98d-4c7e-adab-907f4c2ea6e4',
          timestamp: 1416841045851,
          location: {
              type: 'point',
              coordinates: [
                    -96.79064822,
                    32.78053848
                ]
            },
          calculatedLoadValue: 32.15686274509804,
          vehicleSpeed: 3,
          rpm: 767.75
          }, {
          id: '2d729a46-5830-481a-b600-f7c99e1861ae',
          timestamp: 1416841044852,
          location: {
              type: 'point',
              coordinates: [
                    -96.79065166,
                    32.78053986
                ]
            },
          calculatedLoadValue: 36.07843137254902,
          vehicleSpeed: 4,
          rpm: 763.25
          }
        ],
      meta: {
        pagination: {
          remaining: 9715,
          limit: 3,
          until: 1419725719165,
          links: {
            prior: 'https://telemetry-test.vin.li/api/v1/devices/fe4bbc20-cc90-11e3-8e05-f3abac5b6410/messages?limit=3&until=1416841027851'
            }
          }
        }
      });

      return Vinli.Device.forge('c4627b29-14bd-49c3-8e6a-1f857143039f').messages({ limit: 3 }).then(function(messages) {
        expect(messages).to.have.property('list').that.is.a('array').and.has.lengthOf(3);
        expect(messages).to.have.property('remaining', 9715);
        expect(messages).to.have.property('prior').that.is.a('function');
        m.done();
      });
    });

    it('should return a list of messages with a function to return the prior messages', function() {
      var m = nock('https://telemetry.vin.li')
        .get('/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/messages?limit=3&since=1416841043850')
        .reply(200, {
          messages: [{
            id: '4993fac7-7e0b-4d90-9e57-af8eb1d27170',
            timestamp: 1416841046851,
            calculatedLoadValue: 31.372549019607842,
            vehicleSpeed: 3,
            rpm: 672.5
          }, {
            id: '26f7b270-e98d-4c7e-adab-907f4c2ea6e4',
            timestamp: 1416841045851,
            calculatedLoadValue: 32.15686274509804,
            vehicleSpeed: 3,
            rpm: 767.75
          }, {
            id: '2d729a46-5830-481a-b600-f7c99e1861ae',
            timestamp: 1416841044852,
            calculatedLoadValue: 36.07843137254902,
            vehicleSpeed: 4,
            rpm: 763.25
          }],
        meta: {
          pagination: {
            remaining: 1,
              limit: 3,
              until: 1419731564093,
              since: 1416841043850,
              links: {
                prior: 'https://telemetry-test.vin.li/api/v1/devices/fe4bbc20-cc90-11e3-8e05-f3abac5b6410/messages?limit=3&since=1416841043850&until=1416841044851'
              }
            }
          }
        });

      var n = nock('https://telemetry.vin.li')
        .get('/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/messages?limit=3&since=1416841043850&until=1416841044851')
        .reply(200, {
          messages: [{
            id: 'ef32a83b-bf46-4266-a98d-a4736b83425e',
            timestamp: 1416841043852,
            calculatedLoadValue: 30.980392156862745,
            vehicleSpeed: 8,
            rpm: 698.25
          }],
        meta: {
          pagination: {
            remaining: 0,
              limit: 3,
              until: 1416841044851,
              since: 1416841043850,
              links: { }
            }
          }
        });

      return Vinli.Device.forge('c4627b29-14bd-49c3-8e6a-1f857143039f').messages({ limit: 3, since: 1416841043850 })
        .then(function(messages) {
        expect(messages).to.have.property('list').that.is.a('array').and.has.lengthOf(3);
        expect(messages).to.have.property('remaining', 1);
        expect(messages).to.have.property('prior').that.is.a('function');
        m.done();

        return messages.prior();
      }).then(function(messages) {
        expect(messages).to.have.property('list').that.is.a('array').and.has.lengthOf(1);
        expect(messages).to.have.property('remaining', 0);
        expect(messages).not.to.have.property('prior');

        n.done();
      });
    });
  });

  describe('#message()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('message').that.is.a('function');
    });

    it('should return a single message', function() {
      var m = nock('https://telemetry.vin.li')
        .get('/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/messages/4993fac7-7e0b-4d90-9e57-af8eb1d27170')
        .reply(200, {
          message: {
            id: '4993fac7-7e0b-4d90-9e57-af8eb1d27170',
            timestamp: 1416841046851,
            calculatedLoadValue: 31.372549019607842,
            vehicleSpeed: 3,
            rpm: 672.5
          }
        });

      return Vinli.Device.forge('c4627b29-14bd-49c3-8e6a-1f857143039f').message('4993fac7-7e0b-4d90-9e57-af8eb1d27170')
        .then(function(message) {
        expect(message).to.have.property('id', '4993fac7-7e0b-4d90-9e57-af8eb1d27170');
        m.done();
      });
    });
  });

  xdescribe('#snapshots()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('snapshots').that.is.a('function');
    });
  });

  xdescribe('#locations()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('locations').that.is.a('function');
    });
  });

  describe('#trips()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('trips').that.is.a('function');
    });

    it('should return a list of trips for the device', function() {
      var m = nock('https://trips.vin.li/')
        .get('/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/trips?limit=2')
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
              until: '2015-08-11T22:42:36.591Z',
              since: '1970-01-01T00:00:00.000Z',
              limit: 2,
              sortDir: 'desc',
              links: {
                first: 'http://trips-test.vin.li/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/trips?limit=2',
                last: 'http://trips-test.vin.li/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/trips?limit=2',
                next: 'http://trips-test.vin.li/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/trips?limit=2'
              }
            }
          }
        });

      return Vinli.Device.forge('c4627b29-14bd-49c3-8e6a-1f857143039f').trips({ limit: 2 }).then(function(trips) {
        expect(trips).to.have.property('list').that.is.an('array');
        expect(trips.list).to.have.lengthOf(2);
        expect(trips.list[0]).to.be.instanceOf(Vinli.Trip);
        expect(trips).to.have.property('remaining', 0);
        expect(trips).to.have.property('next').that.is.a('function');

        m.done();
      });
    });
  });

  describe('#reportCards()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('reportCards').that.is.a('function');
    });

    it('should return a list of report cards for the device', function() {
      var m = nock('https://behavioral.vin.li/')
        .get('/api/v1/devices/64013359-093a-4ed1-bd5f-cb47deaea262/report_cards?limit=2')
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

      return Vinli.Device.forge('64013359-093a-4ed1-bd5f-cb47deaea262').reportCards({ limit: 2 }).then(function(reportCards) {
        expect(reportCards).to.have.property('list').that.is.an('array');
        expect(reportCards.list).to.have.lengthOf(2);
        expect(reportCards.list[0]).to.be.instanceOf(Vinli.ReportCard);
        expect(reportCards).to.have.property('remaining', 0);
        expect(reportCards).to.have.property('next').that.is.a('function');
        m.done();
      });
    });
  });

  xdescribe('#rules()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('rules').that.is.a('function');
    });
  });

  xdescribe('#createRule()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('createRule').that.is.a('function');
    });
  });

  describe('#collisions()', function() {
    it('should exist', function() {
      var device = Vinli.Device.forge('asfdafdasfdsdf');
      expect(device).to.have.property('collisions').that.is.a('function');
    });

    it('should return a list of collisions for the devices', function() {
      var m = nock('https://safety.vin.li')
        .get('/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/collisions?limit=2')
        .reply(200, {
          collisions: [{
            id: '06782175-735e-4226-82bc-ebdf887c30f3',
            timestamp: '2015-07-13T17:45:04.583Z',
            location: {
              type: 'Point',
              coordinates: [ -96.917009, 32.766392 ]
            },
            links: { self: 'http://172.17.0.114:3000/api/v1/collisions/06782175-735e-4226-82bc-ebdf887c30f3' }
          }, {
            id: '5b2bf92c-a2c5-4365-9f9b-3d51b8883ad6',
            timestamp: '2015-07-13T17:46:04.583Z',
            location: {
              type: 'Point',
              coordinates: [ -96.917009, 32.766392 ]
            },
            links: { self: 'http://172.17.0.114:3000/api/v1/collisions/5b2bf92c-a2c5-4365-9f9b-3d51b8883ad6' }
          }],
          meta: {
            pagination: {
              remaining: 0,
              until: '2015-07-24T22:11:23.829Z',
              since: '1970-01-01T00:00:00.000Z',
              limit: 2,
              sortDir: 'desc',
              links: {
                prior: 'https://safety.vin.li/api/v1/devices/c4627b29-14bd-49c3-8e6a-1f857143039f/collisions?limit=2&until=1437778166267'
              }
            }
          }
        });

      return Vinli.Device.forge('c4627b29-14bd-49c3-8e6a-1f857143039f').collisions({ limit: 2 })
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
