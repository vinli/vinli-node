var nock = require('nock');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

var client = require('..');
var emptyMeta = {
  pagination: {
    total: 1,
    links: {}
  }
};

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('Client', function(){

  describe('setup', function(){
    beforeEach(function(){
      nock.disableNetConnect();
    });

    afterEach(function(){
      nock.cleanAll();
    });

    it('should require appId', function(){
      expect(function(){
        client({secretKey: 'bar'});
      }).to.throw(/appId is required/);
    });

    it('should require secretKey', function(){
      expect(function(){
        client({appId: 'foo'});
      }).to.throw(/secretKey is required/);
    });

    it('should let you set the hostBase', function(){
      var devices = nock('https://platform.mycompany.com').get('/api/v1/devices')
        .reply(200, {devices: [], meta: emptyMeta});

      return client({appId: 'foo', secretKey: 'bar', hostBase: '.mycompany.com'})
        .App.devices().then(function(){
          devices.done();
        });
    });

    it('should let you set the protocol', function(){
      var devices = nock('http://platform.vin.li:443').get('/api/v1/devices')
        .reply(200, {devices: [], meta: emptyMeta});

      return client({appId: 'foo', secretKey: 'bar', protocol: 'http'})
        .App.devices().then(function(){
          devices.done();
        });
    });

    it('should let you set the port', function(){
      var devices = nock('https://platform.vin.li:1234').get('/api/v1/devices')
        .reply(200, {devices: [], meta: emptyMeta});

      return client({appId: 'foo', secretKey: 'bar', port: 1234})
        .App.devices().then(function(){
          devices.done();
        });
    });

    it('should let you set the apiVersion', function(){
      var devices = nock('https://platform.vin.li').get('/api/v3/devices')
        .reply(200, {devices: [], meta: emptyMeta});

      return client({appId: 'foo', secretKey: 'bar', apiVersion: 'v3'})
        .App.devices().then(function(){
          devices.done();
        });
    });
  });

  describe('exposed resources', function(){
    it('should expose all of the resources', function(){
      var Vinli = client({appId: 'foo', secretKey: 'bar'});

      expect(Vinli).to.have.property('App');
      expect(Vinli).to.have.property('Auth');
      expect(Vinli).to.have.property('Device');
      expect(Vinli).to.have.property('Vehicle');
      expect(Vinli).to.have.property('Trip');
      expect(Vinli).to.have.property('Rule');
      expect(Vinli).to.have.property('EmergencyContact');
    });
  });
});