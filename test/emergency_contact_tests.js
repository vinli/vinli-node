var nock = require('nock');
var expect = require('./helpers/test_helper');

var Vinli = require('..')({appId: 'foo', secretKey: 'bar'});

describe('EmergencyContact', function(){
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
      expect(Vinli.EmergencyContact).to.have.property('fetch').that.is.a('function');
    });

    it('should return an emergency contact with the given id', function(){
      var contact = Vinli.EmergencyContact.forge('c4627b29-14bd-49c3-8e6a-1f857143039f');
      expect(contact).to.have.property('id', 'c4627b29-14bd-49c3-8e6a-1f857143039f');
    });
  });

  describe('.fetch()', function(){
    it('should exist', function(){
      expect(Vinli.EmergencyContact).to.have.property('forge').that.is.a('function');
    });

    it('should fetch an EmergencyContact with the given id from the platform', function(){
      var contactNock = nock('https://safety.vin.li')
        .get('/api/v1/emergency_contacts/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(200, {
          emergencyContact: {
            id: 'c4627b29-14bd-49c3-8e6a-1f857143039f',
            name: 'Mom',
            contactType: 'sms',
            message: 'This is a test',
          }});

      return Vinli.EmergencyContact.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f').then(function(contact){
        expect(contact).to.have.property('id', 'c4627b29-14bd-49c3-8e6a-1f857143039f');
        expect(contact).to.have.property('name', 'Mom');
        expect(contact).to.have.property('message', 'This is a test');
        contactNock.done();
      });
    });

    it('should reject a request for an unknown emergency contact', function(){
      nock('https://safety.vin.li')
        .get('/api/v1/emergency_contacts/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(404, {message: 'Not found'});

      expect(Vinli.EmergencyContact.fetch('c4627b29-14bd-49c3-8e6a-1f857143039f')).to.be.rejectedWith('Not Found');
    });
  });

  describe('#test()', function(){
    it('should exist', function(){
      var device = Vinli.EmergencyContact.forge('asfdafdasfdsdf');
      expect(device).to.have.property('test').that.is.a('function');
    });
  });

  describe('#update()', function(){
    it('should exist', function(){
      var device = Vinli.EmergencyContact.forge('asfdafdasfdsdf');
      expect(device).to.have.property('update').that.is.a('function');
    });
  });

  describe('#delete()', function(){
    it('should exist', function(){
      var device = Vinli.EmergencyContact.forge('asfdafdasfdsdf');
      expect(device).to.have.property('delete').that.is.a('function');
    });

    it('should delete the emergency contact', function(){
      var contactDeleteNock = nock('https://safety.vin.li')
        .delete('/api/v1/emergency_contacts/c4627b29-14bd-49c3-8e6a-1f857143039f')
        .reply(204);

      return Vinli.EmergencyContact.forge('c4627b29-14bd-49c3-8e6a-1f857143039f').delete().then(function(){
        contactDeleteNock.done();
      });
    });
  });
});