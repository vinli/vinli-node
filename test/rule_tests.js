var nock = require('nock');
var expect = require('./helpers/test_helper');

var Vinli = require('..')({ appId: 'foo', secretKey: 'bar' });

describe('Rule', function() {
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
      expect(Vinli.Rule).to.have.property('fetch').that.is.a('function');
    });

    it('should return a rule with the given id', function() {
      var rule = Vinli.Rule.forge('c4627b29-14bd-49c3-8e6a-1f857143039f');
      expect(rule).to.have.property('id', 'c4627b29-14bd-49c3-8e6a-1f857143039f');
    });
  });

  describe('.fetch()', function() {
    it('should exist', function() {
      expect(Vinli.Rule).to.have.property('forge').that.is.a('function');
    });

    it('should fetch a rule with the given id from the platform', function() {
      var ruleMock = nock('https://rules.vin.li')
        .get('/api/v1/rules/fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .reply(200, {
          rule: {
            id: 'fc8bdd0c-5be3-46d5-8582-b5b54052eca2',
            deviceId: '1a2cb688-de46-47f0-a8a6-a8569b085fb3',
            name: 'Speed over 35mph near Superdome',
            boundaries: [
              {
                type: 'parametric',
                parameter: 'vehicleSpeed',
                min: 35
              },
              {
                type: 'radius',
                lon: -90.0811,
                lat: 29.9508,
                radius: 500
              }
            ],
            links: {
              self: 'https://events.vin.li/api/v1/rules/68d489c0-d7a2-11e3-9c1a-0800200c9a66',
              events: 'https://events.vin.li/api/v1/rules/68d489c0-d7a2-11e3-9c1a-0800200c9a66/events'
            }
          }
        });

      return Vinli.Rule.fetch('fc8bdd0c-5be3-46d5-8582-b5b54052eca2').then(function(rule) {
        expect(rule).to.be.an.instanceOf(Vinli.Rule);
        expect(rule).to.have.property('id', 'fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
        expect(rule).to.have.property('name', 'Speed over 35mph near Superdome');
        ruleMock.done();
      });
    });

    it('should reject a request for an unknown Rule', function() {
      nock('https://rules.vin.li')
        .get('/api/v1/rules/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(404, { message: 'Not found' });

      expect(Vinli.Rule.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f')).to.be.rejectedWith(/Not found/);
    });
  });

  describe('#createSubscription()', function() {
    it('should exist', function() {
      var rule = Vinli.Rule.forge('asfdafdasfdsdf');
      expect(rule).to.have.property('createSubscription').that.is.a('function');
    });

    it('should return a Subscription object', function() {
      var sub = {
        deviceId: '9d5c90b9-c6c7-4544-96b0-f3eb88ca6937',
        eventType: 'startup',
        url: 'http://127.0.0.1/'
      };

      var m = nock('https://events.vin.li')
        .post('/api/v1/devices/9d5c90b9-c6c7-4544-96b0-f3eb88ca6937/subscriptions', {
          subscription: sub
        }).reply(201, {
          subscription: {
            id: 'a9f58fc2-67b3-4625-aa4f-e93ab5d183f1',
            deviceId: '9d5c90b9-c6c7-4544-96b0-f3eb88ca6937',
            eventType: 'startup',
            url: 'http://127.0.0.1/',
            createdAt: '2015-12-02T16:02:37.315Z',
            updatedAt: '2015-12-02T16:02:37.315Z',
            links: {
              self: 'https://events.vin.li/api/v1/subscriptions/9d5c90b9-c6c7-4544-96b0-f3eb88ca6937',
              notifications: 'https://events.vin.li/api/v1/subscriptions/9d5c90b9-c6c7-4544-96b0-f3eb88ca6937/notifications'
            }
          }
        });

      return Vinli.Rule.forge('9d5c90b9-c6c7-4544-96b0-f3eb88ca6937').createSubscription(sub)
        .then(function(subscription) {
          expect(subscription).to.be.an.instanceOf(Vinli.Subscription);
          expect(subscription).to.have.property('id').that.is.a('string');
          expect(subscription).to.have.property('deviceId', '9d5c90b9-c6c7-4544-96b0-f3eb88ca6937');
          expect(subscription).to.have.property('eventType', 'startup');
          expect(subscription).to.have.property('url', 'http://127.0.0.1/');
          expect(subscription).to.have.property('createdAt').that.is.a('string');
          expect(subscription).to.have.property('updatedAt').that.is.a('string');
          expect(subscription).to.have.property('links').that.is.an('object');

          m.done();
        });
    });
  });

  xdescribe('#events()', function() {
    it('should exist', function() {
      var rule = Vinli.Rule.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
      expect(rule).to.have.property('events').that.is.a('function');
    });
  });

  describe('#delete()', function() {
    it('should exist', function() {
      var rule = Vinli.Rule.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
      expect(rule).to.have.property('delete').that.is.a('function');
    });

    it('should delete the rule', function() {
      var m = nock('https://rules.vin.li')
        .delete('/api/v1/rules/fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .reply(204);

      return Vinli.Rule.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2').delete().then(function() {
        m.done();
      });
    });
  });
});