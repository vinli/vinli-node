var nock = require('nock');
var expect = require('./helpers/test_helper');

var Vinli;

describe('OdometerTrigger', function() {
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
      expect(Vinli.OdometerTrigger).to.have.property('forge').that.is.a('function');
    });

    it('should return an OdometerTrigger with the given id', function() {
      var odometerTrigger = Vinli.OdometerTrigger.forge('a095ae10-6e1f-4d46-a56f-b1855573e9cb');
      expect(odometerTrigger).to.have.property('id', 'a095ae10-6e1f-4d46-a56f-b1855573e9cb');
    });
  });

  describe('.fetch()', function() {
    it('should exist', function() {
      expect(Vinli.OdometerTrigger).to.have.property('fetch').that.is.a('function');
    });

    it('should fetch an odometerTrigger given the id', function() {
      var odometerTriggerId = 'c4150a36-4f52-4894-8a36-ac413861d657';
      var odometerTriggerNock = nock('https://distance.vin.li')
        .get('/api/v1/odometer_triggers/' + odometerTriggerId)
        .reply(200, {
          odometerTrigger: {
            id: odometerTriggerId,
            vehicleId: 'ab4e7199-a3a6-412f-9088-bc05b6d89e31',
            type: 'from_now',
            threshold: 9496.086,
            events: 0,
            links: {
              vehicle: 'https://platform.vin.li/api/v1/vehicles/ab4e7199-a3a6-412f-9088-bc05b6d89e31'
            }
          }
        });

      return Vinli.OdometerTrigger.fetch(odometerTriggerId).then(function(trigger) {
        expect(trigger).to.be.an.instanceOf(Vinli.OdometerTrigger);
        expect(trigger).to.have.property('id', odometerTriggerId);
        expect(trigger).to.have.property('vehicleId');
        expect(trigger).to.have.property('type');
        expect(trigger).to.have.property('threshold');
        expect(trigger).to.have.property('events');
        odometerTriggerNock.done();
      });
    });

    it('should not fetch an unknown odometerTrigger', function() {
      nock('https://distance.vin.li')
        .get('/api/v1/odometer_triggers/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(404, { message: 'Not found' });

      expect(Vinli.OdometerTrigger.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f')).to.be.rejectedWith(/Not found/);
    });
  });

  describe('#delete()', function() {
    it('should exist', function() {
      var odometer = Vinli.OdometerTrigger.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
      expect(odometer).to.have.property('delete').that.is.a('function');
    });

    it('should delete the odometerTrigger', function() {
      var m = nock('https://distance.vin.li')
        .delete('/api/v1/odometer_triggers/fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .reply(204);

      return Vinli.OdometerTrigger.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2').delete().then(function() {
        m.done();
      });
    });
  });
});
