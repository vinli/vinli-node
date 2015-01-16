var nock = require('nock');
var expect = require('./helpers/test_helper');

var Vinli = require('..')({appId: 'foo', secretKey: 'bar'});

describe('Rule', function(){
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
      expect(Vinli.Rule).to.have.property('fetch').that.is.a('function');
    });

    it('should return a rule with the given id', function(){
      var rule = Vinli.Rule.forge('c4627b29-14bd-49c3-8e6a-1f857143039f');
      expect(rule).to.have.property('id', 'c4627b29-14bd-49c3-8e6a-1f857143039f');
    });
  });

  describe('.fetch()', function(){
    it('should exist', function(){
      expect(Vinli.Rule).to.have.property('forge').that.is.a('function');
    });

    it('should fetch a rule with the given id from the platform', function(){
      var ruleMock = nock('https://events.vin.li')
        .get('/api/v1/rules/fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .reply(200, {
          'rule' : {
            'id' : 'fc8bdd0c-5be3-46d5-8582-b5b54052eca2',
            'name' : 'Speed over 35mph near Superdome',
            'boundaries' : [
              {
                'type' : 'parametric',
                'parameter' : 'vehicleSpeed',
                'min' : 35
              },
              {
                'type' : 'radius',
                'lon' : -90.0811,
                'lat' : 29.9508,
                'radius' : 500
              }
            ],
            'device' : '602c6490-d7a3-11e3-9c1a-0800200c9a66',
            'notificationUrl' : 'https://www.myapp.com/vinli_events?internalRuleId=1314',
            'notificationMetadata' : {
              'userFirstName': 'John',
              'userLastName': 'Sample',
              'smsPhoneNumber': '2145551212'
            },
            'links' : {
              'self' : 'https://events.vin.li/api/v1/rules/68d489c0-d7a2-11e3-9c1a-0800200c9a66',
              'events' : 'https://events.vin.li/api/v1/rules/68d489c0-d7a2-11e3-9c1a-0800200c9a66/events'
            }
          }
        });

      return Vinli.Rule.fetch('fc8bdd0c-5be3-46d5-8582-b5b54052eca2').then(function(rule){
        expect(rule).to.be.an.instanceOf(Vinli.Rule);
        expect(rule).to.have.property('id', 'fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
        expect(rule).to.have.property('name', 'Speed over 35mph near Superdome');
        ruleMock.done();
      });
    });

    it('should reject a request for an unknown Rule', function(){
      nock('https://events.vin.li')
        .get('/api/v1/rules/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(404, {message: 'Not found'});

      expect(Vinli.Rule.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f')).to.be.rejectedWith('Not Found');
    });
  });

  xdescribe('#events()', function(){
    it('should exist', function(){
      var rule = Vinli.Rule.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
      expect(rule).to.have.property('events').that.is.a('function');
    });
  });

  xdescribe('#delete()', function(){
    it('should exist', function(){
      var rule = Vinli.Rule.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
      expect(rule).to.have.property('delete').that.is.a('function');
    });
  });

  describe('#currentState()', function(){
    it('should exist', function(){
      var rule = Vinli.Rule.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
      expect(rule).to.have.property('currentState').that.is.a('function');
    });

    it('should require a device if the Rule has not been fetched', function(){
      var rule = Vinli.Rule.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
      expect(rule.currentState()).to.be.rejectedWith();
    });

    it('should fetch the rule state from the platform', function(){
      var m = nock('https://events.vin.li')
        .get('/api/v1/rules/fc8bdd0c-5be3-46d5-8582-b5b54052eca2/devices/270795d3-1945-4728-ad7c-47247487dcda/state')
        .reply(200, {
          'state': {
            'rule': 'fc8bdd0c-5be3-46d5-8582-b5b54052eca2',
            'device': '270795d3-1945-4728-ad7c-47247487dcda',
            'evaluated': true,
            'covered': false
          }
        });

      return Vinli.Rule.forge('fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .currentState(Vinli.Device.forge('270795d3-1945-4728-ad7c-47247487dcda'))
        .then(function(state){
          expect(state).to.be.an('object');
          expect(state).to.have.property('state').that.is.an('object');
          expect(state.state).to.have.property('evaluated', true);
          expect(state.state).to.have.property('covered', false);

          m.done();
        });
    });
  });
});