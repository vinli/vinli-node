var nock = require('nock');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

var Vinli;

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('User', function(){
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
      expect(Vinli.User).to.have.property('fetch').that.is.a('function');
    });

    it('should return a user with the given id', function(){
      var user = Vinli.User.forge('c4627b29-14bd-49c3-8e6a-1f857143039f');
      expect(user).to.have.property('accessToken', 'c4627b29-14bd-49c3-8e6a-1f857143039f');
    });
  });

  describe('.fetch()', function(){
    it('should exist', function(){
      expect(Vinli.User).to.have.property('forge').that.is.a('function');
    });

    it('should fetch an user with the given token from the platform', function(){
      var m = nock('https://auth.vin.li')
        .get('/user?access_token=fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .reply(200, {
          user: {
            'firstName': 'John',
            'lastName': 'Sample',
            'email': 'john@vin.li'
          }
        });

      return Vinli.User.fetch('fc8bdd0c-5be3-46d5-8582-b5b54052eca2').then(function(user){
        expect(user).to.be.an.instanceOf(Vinli.User);
        expect(user).to.have.property('accessToken', 'fc8bdd0c-5be3-46d5-8582-b5b54052eca2');
        expect(user).to.have.property('firstName', 'John');
        m.done();
      });
    });

    it('should reject a request for an unknown emergency contact', function(){
      nock('https://platform.vin.li')
        .get('/api/v1/vehicles/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(404, {message: 'Not found'});

      expect(Vinli.Vehicle.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f')).to.be.rejectedWith(/Not found/);
    });
  });

  describe('.devices()', function() {
    it('should exist', function() {
      expect(Vinli.User.forge('c4627b29-14bd-49c3-8e6a-1f857143039f'))
        .to.have.property('devices').that.is.a('function');
    });

    it('should fetch an user with the given token from the platform', function(){
      var m = nock('https://auth.vin.li')
        .get('/user?access_token=fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .reply(200, {
          user: {
            firstName: 'John',
            lastName: 'Sample',
            email: 'john@vin.li'
          }
        });

      var n = nock('https://auth.vin.li')
        .get('/user/devices?access_token=fc8bdd0c-5be3-46d5-8582-b5b54052eca2')
        .reply(200, {
          devices: [{
            id: '54db7f75-209b-4aa1-b48d-e8ced66fdfe2',
            name: 'Camry'
          }]
        });

      return Vinli.User.fetch('fc8bdd0c-5be3-46d5-8582-b5b54052eca2').then(function(user){
        return user.devices();
      }).then(function(devices) {
        expect(devices).to.have.property('list').that.is.an('array');
        expect(devices.list).to.have.lengthOf(1);
        expect(devices.list[0]).to.have.property('id', '54db7f75-209b-4aa1-b48d-e8ced66fdfe2');
        expect(devices.list[0]).to.have.property('name', 'Camry');
        m.done();
        n.done();
      });
    });
  });
});