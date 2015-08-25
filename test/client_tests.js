var nock = require('nock');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

var Client = require('..');
var emptyMeta = {
  pagination: {
    total: 1,
    links: {}
  }
};

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('Client', function() {
  describe('setup', function() {
    beforeEach(function() {
      nock.disableNetConnect();
    });

    afterEach(function() {
      nock.cleanAll();
    });

    it('should require appId', function() {
      expect(function() {
        return new Client({ secretKey: 'bar' });
      }).to.throw(/\[appId\]/);
    });

    it('should require secretKey', function() {
      expect(function() {
        return new Client({ appId: 'foo' });
      }).to.throw(/\[secretKey\]/);
    });

    it('should let you set the hostBase', function() {
      var devices = nock('https://platform.mycompany.com').get('/api/v1/devices/03afc858-23ff-4738-8eb2-4dec0e364205')
        .reply(200, { devices: [], meta: emptyMeta });

      return new Client({ appId: 'foo', secretKey: 'bar', hostBase: '.mycompany.com' })
        .Device.fetch('03afc858-23ff-4738-8eb2-4dec0e364205').then(function() {
          devices.done();
        });
    });

    it('should let you set the protocol', function() {
      var devices = nock('http://platform.vin.li:443').get('/api/v1/devices/03afc858-23ff-4738-8eb2-4dec0e364205')
        .reply(200, { devices: [], meta: emptyMeta });

      return new Client({ appId: 'foo', secretKey: 'bar', protocol: 'http' })
        .Device.fetch('03afc858-23ff-4738-8eb2-4dec0e364205').then(function() {
          devices.done();
        });
    });

    it('should let you set the port', function() {
      var devices = nock('https://platform.vin.li:1234').get('/api/v1/devices/03afc858-23ff-4738-8eb2-4dec0e364205')
        .reply(200, { devices: [], meta: emptyMeta });

      return new Client({ appId: 'foo', secretKey: 'bar', port: 1234 })
        .Device.fetch('03afc858-23ff-4738-8eb2-4dec0e364205').then(function() {
          devices.done();
        });
    });

    it('should let you set the apiVersion', function() {
      var devices = nock('https://platform.vin.li').get('/api/v1/devices/03afc858-23ff-4738-8eb2-4dec0e364205')
        .reply(200, { devices: [], meta: emptyMeta });

      return new Client({ appId: 'foo', secretKey: 'bar', apiVersion: 'v1' })
        .Device.fetch('03afc858-23ff-4738-8eb2-4dec0e364205').then(function() {
          devices.done();
        });
    });

    it('should let you set the serviceOrigins', function() {
      var device = nock('http://foo.vin.li').get('/api/v1/devices/03afc858-23ff-4738-8eb2-4dec0e364205')
        .reply(200, { device: { id: '03afc858-23ff-4738-8eb2-4dec0e364205' } });

      return new Client({
        appId: 'foo',
        secretKey: 'bar',
        serviceOrigins: {
          platform: 'http://foo.vin.li',
          auth: 'http://foo.vin.li',
          telemetry: 'http://foo.vin.li',
          event: 'http://foo.vin.li',
          rule: 'http://foo.vin.li',
          trip: 'http://foo.vin.li',
          diagnostic: 'http://foo.vin.li',
          safety: 'http://foo.vin.li',
          behavioral: 'http://foo.vin.li'
        }
      }).Device.fetch('03afc858-23ff-4738-8eb2-4dec0e364205').then(function() {
        device.done();
      });
    });
  });

  describe('exposed resources', function() {
    it('should expose all of the resources', function() {
      var vinli = new Client({ appId: 'foo', secretKey: 'bar' });

      expect(vinli).to.have.property('App');
      expect(vinli).to.have.property('Auth');
      expect(vinli).to.have.property('User');
      expect(vinli).to.have.property('Device');
      expect(vinli).to.have.property('Vehicle');
      expect(vinli).to.have.property('Trip');
      expect(vinli).to.have.property('Code');
      expect(vinli).to.have.property('Rule');
      expect(vinli).to.have.property('Event');
      expect(vinli).to.have.property('Subscription');
    });
  });
});
